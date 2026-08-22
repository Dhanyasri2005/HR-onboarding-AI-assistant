import {
  useEffect,
  useRef,
  useState
} from "react";

import Message from "./Message";

const API_URL =
  "https://hr-onboarding-ai-assistant.vercel.app";

function Chat({
  onTaskCreated
}) {
  const [messages, setMessages] =
    useState([
      {
        role: "assistant",
        content:
          "Hi! I'm your HR Onboarding Assistant. I can answer questions about benefits, IT setup, and company policies using the provided onboarding documents. I can also create and track your onboarding tasks."
      }
    ]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const messagesEndRef =
    useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, loading]);

  async function sendMessage(
    customMessage = null
  ) {
    const userMessage =
      (
        customMessage ?? input
      ).trim();

    if (
      !userMessage ||
      loading
    ) {
      return;
    }

    const userChatMessage = {
      role: "user",
      content: userMessage
    };

    setMessages(
      (previous) => [
        ...previous,
        userChatMessage
      ]
    );

    setInput("");
    setLoading(true);

    try {

      const history = [
        ...messages,
        userChatMessage
      ];

      const response =
        await fetch(
          `${API_URL}/api/chat`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              message:
                userMessage,
              history
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Request failed."
        );
      }

      setMessages(
        (previous) => [
          ...previous,
          {
            role: "assistant",

            content:
              data.answer ||
              "I couldn't generate a response.",

            sources:
              data.sources || []
          }
        ]
      );

      if (
        data.type ===
          "task_created" &&
        onTaskCreated
      ) {
        onTaskCreated();
      }

    } catch (error) {

      console.error(error);

      setMessages(
        (previous) => [
          ...previous,
          {
            role: "assistant",

            content:
              "I couldn't connect to the onboarding service. Please make sure the backend server is running."
          }
        ]
      );

    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage();
  }

  return (
    <div className="chat-page">

      <div className="chat-header">

        <div>
          <h1>
            HR Onboarding Assistant
          </h1>

          <p>
            Ask questions about your
            onboarding journey
          </p>
        </div>

        <div className="online-status">
          <span className="status-dot"></span>
          AI Assistant Online
        </div>

      </div>

      <div className="suggestions">

        <button
          onClick={() =>
            sendMessage(
              "What benefits are available to employees?"
            )
          }
        >
          💼 Benefits & Insurance
        </button>

        <button
          onClick={() =>
            sendMessage(
              "What do I need to know about IT setup?"
            )
          }
        >
          💻 IT Setup
        </button>

        <button
          onClick={() =>
            sendMessage(
              "What onboarding policies should I know?"
            )
          }
        >
          📘 Policies
        </button>

        <button
          onClick={() =>
            sendMessage(
              "What are my onboarding tasks?"
            )
          }
        >
          ✓ My Tasks
        </button>

      </div>

      <div className="chat-container">

        <div className="messages">

          {messages.map(
            (message, index) => (
              <Message
                key={index}
                message={message}
              />
            )
          )}

          {loading && (

            <div className="message-row assistant-row">

              <div className="message-avatar ai-avatar">
                AI
              </div>

              <div className="message-bubble assistant-bubble">

                <div className="typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

              </div>

            </div>

          )}

          <div ref={messagesEndRef} />

        </div>

        <form
          className="chat-input-area"
          onSubmit={handleSubmit}
        >

          <input
            value={input}
            onChange={(event) =>
              setInput(
                event.target.value
              )
            }
            placeholder="Ask about benefits, IT setup, policies, or tasks..."
            disabled={loading}
          />

          <button
            type="submit"
            disabled={
              loading ||
              !input.trim()
            }
          >
            ➤
          </button>

        </form>

        <div className="chat-disclaimer">
          Answers are grounded in the
          provided onboarding documents.
        </div>

      </div>

    </div>
  );
}

export default Chat;