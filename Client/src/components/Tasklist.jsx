import {
  useEffect,
  useState
} from "react";

const API_URL =
  "https://hr-onboarding-ai-assistant.vercel.app";

function TaskList({
  onTasksLoaded
}) {
  const [tasks, setTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function fetchTasks() {
    try {

      setLoading(true);
      setError("");

      const response =
        await fetch(
          `${API_URL}/api/tasks`
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to load tasks."
        );
      }

      setTasks(data.tasks);

      if (onTasksLoaded) {
        onTasksLoaded(
          data.tasks
        );
      }

    } catch (error) {

      console.error(error);

      setError(
        "Unable to load tasks. Make sure the backend is running."
      );

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function updateTask(
    taskId,
    status
  ) {
    try {

      const response =
        await fetch(
          `${API_URL}/api/tasks/${taskId}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              status
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to update task."
        );
      }

      setTasks(
        (previous) =>
          previous.map(
            (task) =>
              task.id === taskId
                ? data.task
                : task
          )
      );

    } catch (error) {

      console.error(error);

      alert(
        "Unable to update the task."
      );
    }
  }

  if (loading) {
    return (
      <div className="page-loading">
        Loading your tasks...
      </div>
    );
  }

  return (
    <div className="tasks-page">

      <div className="tasks-header">

        <div>
          <h1>
            My Onboarding Tasks
          </h1>

          <p>
            Track your onboarding progress
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchTasks}
        >
          ↻ Refresh
        </button>

      </div>

      {error && (
        <div className="error-card">
          ⚠️ {error}
        </div>
      )}

      {!error &&
        tasks.length === 0 && (

          <div className="empty-tasks">

            <div className="empty-icon">
              ✓
            </div>

            <h2>
              No onboarding tasks yet
            </h2>

            <p>
              Ask the HR Assistant to
              create your first task.
            </p>

          </div>
        )}

      <div className="task-grid">

        {tasks.map(
          (task) => (

            <div
              className="task-card"
              key={task.id}
            >

              <div className="task-card-top">

                <div className="task-icon">
                  ✓
                </div>

                <span
                  className={`status-badge ${task.status
                    .toLowerCase()
                    .replace(
                      " ",
                      "-"
                    )}`}
                >
                  {task.status}
                </span>

              </div>

              <h3>
                {task.title}
              </h3>

              <p className="task-id">
                {task.id}
              </p>

              <p className="task-date">
                Created{" "}
                {new Date(
                  task.createdAt
                ).toLocaleDateString()}
              </p>

              {task.status !==
                "Completed" && (

                <button
                  className="complete-button"
                  onClick={() =>
                    updateTask(
                      task.id,
                      "Completed"
                    )
                  }
                >
                  Mark as Completed
                </button>

              )}

            </div>

          )
        )}

      </div>

    </div>
  );
}

export default TaskList;