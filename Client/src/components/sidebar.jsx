function Sidebar({
  activePage,
  setActivePage,
  pendingCount
}) {
  return (
    <aside className="sidebar">

      <div className="brand">

        <div className="brand-icon">
          H
        </div>

        <div>
          <div className="brand-title">
            HR Onboarding
          </div>

          <div className="brand-subtitle">
            AI Employee
          </div>
        </div>

      </div>

      <nav className="navigation">

        <button
          className={
            activePage === "chat"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            setActivePage("chat")
          }
        >
          <span>💬</span>
          <span>Assistant</span>
        </button>

        <button
          className={
            activePage === "tasks"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            setActivePage("tasks")
          }
        >
          <span>✓</span>
          <span>My Tasks</span>

          {pendingCount > 0 && (
            <span className="task-count">
              {pendingCount}
            </span>
          )}
        </button>

      </nav>

      <div className="sidebar-bottom">

        <div className="employee-card">

          <div className="avatar">
            NE
          </div>

          <div>
            <strong>
              New Employee
            </strong>

            <span>
              Onboarding
            </span>
          </div>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;