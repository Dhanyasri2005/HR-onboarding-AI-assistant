import { useEffect, useState } from "react";

import Sidebar from "./components/sidebar";
import Chat from "./components/chat";
import TaskList from "./components/Tasklist";

function App() {
  const [activePage, setActivePage] = useState("chat");
  const [tasks, setTasks] = useState([]);

  async function loadTasks() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/tasks"
      );

      const data = await response.json();

      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error("Could not load tasks:", error);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const pendingCount = tasks.filter(
    (task) => task.status !== "Completed"
  ).length;

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        pendingCount={pendingCount}
      />

      <main className="main-content">
        {activePage === "chat" ? (
          <Chat onTaskCreated={loadTasks} />
        ) : (
          <TaskList onTasksLoaded={setTasks} />
        )}
      </main>
    </div>
  );
}

export default App;