function Message({ message }) {

  const isUser =
    message.role === "user";

  return (
    <div
      className={
        isUser
          ? "message-row user-row"
          : "message-row assistant-row"
      }
    >

      {!isUser && (
        <div className="message-avatar ai-avatar">
          AI
        </div>
      )}

      <div
        className={
          isUser
            ? "message-bubble user-bubble"
            : "message-bubble assistant-bubble"
        }
      >

        <div className="message-text">

          {message.content
            .split("\n")
            .map(
              (line, index) => (
                <span
                  key={index}
                  className="message-line"
                >
                  {line}
                </span>
              )
            )}

        </div>

        {message.sources &&
          message.sources.length > 0 && (

            <div className="sources">

              <div className="source-title">
                📄 Sources
              </div>

              {message.sources.map(
                (source) => (
                  <span
                    key={source}
                    className="source-badge"
                  >
                    {source}
                  </span>
                )
              )}

            </div>

          )}

      </div>

      {isUser && (
        <div className="message-avatar user-avatar">
          You
        </div>
      )}

    </div>
  );
}

export default Message;