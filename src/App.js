import React, { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";

import sampleData from "./aiData/sampleData.json";
import sampleProductData from "./aiData/sampleProductData.json";

import botImage from "./assets/bot.png";
import personImage from "./assets/person.png";
import newChatImage from "./assets/newchat.png";
import editImage from "./assets/edit.png";

import "./App.css";

const HISTORY_KEY = "productRecommendationHistory";

const getHistory = () => {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

function Header({ darkMode, setDarkMode }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand-mark">✦</div>
        <h1>Product Recommendation AI</h1>
      </div>

      <div className="header-actions">
      <button
  type="button"
  className="history-link"
  onClick={() => {
    window.location.href = "/history";
  }}
>
  Previous Conversations
</button>

        <button
          type="button"
          className="theme-button"
          onClick={() => setDarkMode((value) => !value)}
          aria-label="Toggle theme"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <Link className="new-suggestion-link" to="/">
        <img src={newChatImage} alt="" />
        <span>Want new suggestion?</span>
      </Link>

      <Link className="sidebar-history-link" to="/history">
        <img src={editImage} alt="" />
        <span>Previous Suggestions</span>
      </Link>
    </aside>
  );
}

function ChatMessage({ message, onFeedback }) {
  const isUser = message.role === "user";

  return (
    <div className={`message-row ${isUser ? "user-row" : "ai-row"}`}>
      {!isUser && (
        <img className="avatar" src={botImage} alt="AI" />
      )}

      <div className={`message-bubble ${isUser ? "user-bubble" : "ai-bubble"}`}>
        {Array.isArray(message.content) ? (
          message.content.map((item, index) => (
            <div key={`${item}-${index}`} className="product-line">
              {item.includes("Link:") ? (
                <>
                  {item.split(", Link:")[0]},{" "}
                  <a
                    href={item.split(", Link:")[1].trim()}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Visit
                  </a>
                </>
              ) : (
                item
              )}
            </div>
          ))
        ) : (
          <div>{message.content}</div>
        )}

        {!isUser && message.showFeedback && (
          <div className="feedback-actions">
            <button
              type="button"
              className="feedback-button"
              onClick={() => onFeedback(message.id, "up")}
              aria-label="Thumbs up"
            >
              👍
            </button>

            <button
              type="button"
              className="feedback-button"
              onClick={() => onFeedback(message.id, "down")}
              aria-label="Thumbs down"
            >
              👎
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <img className="avatar" src={personImage} alt="You" />
      )}
    </div>
  );
}

function FeedbackPanel({ feedback, setFeedback, onSave }) {
  if (!feedback) {
    return null;
  }

  if (feedback.type === "up") {
    return (
      <div className="feedback-panel">
        <p>How would you rate this recommendation?</p>

        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              className={feedback.rating >= star ? "star selected" : "star"}
              onClick={() =>
                setFeedback({
                  ...feedback,
                  rating: star,
                })
              }
            >
              ★
            </button>
          ))}
        </div>

        <button
          type="button"
          className="feedback-submit"
          onClick={onSave}
        >
          Submit Rating
        </button>
      </div>
    );
  }

  return (
    <div className="feedback-panel">
      <p>Provide Additional Feedback</p>

      <textarea
        value={feedback.text}
        onChange={(event) =>
          setFeedback({
            ...feedback,
            text: event.target.value,
          })
        }
        placeholder="Tell us what went wrong..."
      />

      <button
        type="button"
        className="feedback-submit"
        onClick={onSave}
      >
        Submit Feedback
      </button>
    </div>
  );
}

function HomePage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [saved, setSaved] = useState(false);


  const quickSuggestions = useMemo(
    () => ["Jeans", "T-Shirt", "Smartphone", "Laptop", "Headphones"],
    []
  );

  const addMessage = (role, content, extra = {}) => {
    return {
      id: `${Date.now()}-${Math.random()}`,
      role,
      content,
      ...extra,
    };
  };

  const findQuestion = (question) => {
    const normalized = question.trim().toLowerCase();

    return sampleData.find(
      (item) => item.question.toLowerCase() === normalized
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const query = input.trim();

    if (!query) {
      return;
    }

    const userMessage = addMessage("user", query);
    const matchingQuestion = findQuestion(query);

    if (!matchingQuestion) {
      const aiMessage = addMessage(
        "ai",
        "Sorry, I did not understand your query!",
        { showFeedback: true }
      );

      setMessages((current) => [...current, userMessage, aiMessage]);
      setInput("");
      return;
    }

    const aiMessage = addMessage(
      "ai",
      matchingQuestion.response,
      {
        showFeedback: true,
        productQuestion: matchingQuestion.question,
      }
    );

    setMessages((current) => [...current, userMessage, aiMessage]);
    setInput("");
  };

  const handleQuickSuggestion = (suggestion) => {
    setInput(suggestion);
  };

  const handleBudget = (budget) => {
    if (!messages.length) {
      return;
    }

    const lastUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user");

    if (!lastUserMessage) {
      return;
    }

    const key = `${lastUserMessage.content} ${budget}`;

    const productResult = sampleProductData.find(
      (item) => item.question.toLowerCase() === key.toLowerCase()
    );

    if (!productResult) {
      return;
    }

    setMessages((current) => [
      ...current,
      addMessage("user", budget),
      addMessage("ai", productResult.response, {
        showFeedback: true,
      }),
    ]);
  };

  const saveConversation = () => {
    if (!messages.length) {
      return;
    }

    const history = getHistory();

    const conversation = {
      id: Date.now(),
      date: new Date().toISOString(),
      messages,
      rating: null,
    };

    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify([...history, conversation])
    );

    setSaved(true);
  };

  const handleFeedback = (messageId, type) => {
    setFeedback({
      messageId,
      type,
      rating: type === "up" ? 0 : null,
      text: "",
    });
  };

  const saveFeedback = () => {
    if (!feedback) {
      return;
    }


    const feedbackRecord = {
      ...feedback,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "productRecommendationFeedback",
      JSON.stringify(feedbackRecord)
    );

    setFeedback(null);
  };

  const showBudgetButtons =
    messages.length > 0 &&
    messages[messages.length - 1].role === "ai" &&
    typeof messages[messages.length - 1].content === "string" &&
    messages[messages.length - 1].content.startsWith(
      "Please select your budget"
    );

  return (
    <main className="chat-page">
      <div className="welcome-section">
        <img className="welcome-bot" src={botImage} alt="Product Recommendation AI" />

        <div>
          <h2>What are you looking for today?</h2>
          <p>
            Tell me what product you need and I&apos;ll help you find the right
            recommendation.
          </p>
        </div>
      </div>

      {messages.length === 0 && (
        <div className="quick-suggestions">
          {quickSuggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => handleQuickSuggestion(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <section className="messages">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onFeedback={handleFeedback}
          />
        ))}
      </section>

      {showBudgetButtons && (
        <div className="budget-options">
          {sampleData
            .find(
              (item) =>
                item.question ===
                messages[messages.length - 2]?.content
            )
            ?.response?.replace("Please select your budget (", "")
            .replace(")", "")
            .split(", ")
            .map((budget) => (
              <button
                type="button"
                key={budget}
                onClick={() => handleBudget(budget)}
              >
                {budget}
              </button>
            ))}
        </div>
      )}

      <FeedbackPanel
        feedback={feedback}
        setFeedback={setFeedback}
        onSave={saveFeedback}
      />

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Please tell me about your query!"
          aria-label="Query"
        />

        <button type="submit">Ask</button>
      </form>

      <div className="conversation-actions">
        <button
          type="button"
          className={saved ? "save-button saved" : "save-button"}
          onClick={saveConversation}
        >
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </main>
  );
}

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [ratingFilter, setRatingFilter] = useState("all");

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const filteredHistory = history.filter((conversation) => {
    if (ratingFilter === "all") {
      return true;
    }

    return String(conversation.rating) === ratingFilter;
  });

  return (
    <main className="history-page">
      <div className="history-heading">
        <div>
          <p className="eyebrow">YOUR SAVED CONVERSATIONS</p>
          <h2>Previous Suggestions</h2>
        </div>

        <select
          value={ratingFilter}
          onChange={(event) => setRatingFilter(event.target.value)}
          aria-label="Filter by rating"
        >
          <option value="all">All ratings</option>
          <option value="5">5 stars</option>
          <option value="4">4 stars</option>
          <option value="3">3 stars</option>
          <option value="2">2 stars</option>
          <option value="1">1 star</option>
        </select>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="empty-history">
          <h3>No previous suggestions yet</h3>
          <p>Save a conversation and it will appear here.</p>
        </div>
      ) : (
        <div className="history-list">
          {filteredHistory.map((conversation) => (
            <article className="history-card" key={conversation.id}>
              <div className="history-card-header">
                <span>
                  {new Date(conversation.date).toLocaleString()}
                </span>

                {conversation.rating && (
                  <span>{"★".repeat(conversation.rating)}</span>
                )}
              </div>

              {conversation.messages.map((message) => (
                <div
                  className={`history-message ${
                    message.role === "user" ? "history-user" : "history-ai"
                  }`}
                  key={message.id}
                >
                  <strong>
                    {message.role === "user" ? "You" : "AI"}
                  </strong>

                  <div>
                    {Array.isArray(message.content)
                      ? message.content.join(" ")
                      : message.content}
                  </div>
                </div>
              ))}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? "app dark-mode" : "app"}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="app-layout">
        <Sidebar />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;