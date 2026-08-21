require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {
  loadDocuments,
  getSources
} = require("./services/documentService");

const chatRoutes =
  require("./routes/chatRoutes");

const taskRoutes =
  require("./routes/taskRoutes");

const app = express();

const PORT =
  process.env.PORT || 5000;

/* MIDDLEWARE */

app.use(
  cors({
    origin:
      "http://localhost:5173"
  })
);

app.use(
  express.json({
    limit: "2mb"
  })
);

/* HEALTH CHECK */

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      success: true,
      message:
        "HR Onboarding AI server is running."
    });
  }
);

/* DOCUMENTS */

app.get(
  "/api/documents",
  (req, res) => {
    res.json({
      success: true,
      documents:
        getSources()
    });
  }
);

/* ROUTES */

app.use(
  "/api/chat",
  chatRoutes
);

app.use(
  "/api/tasks",
  taskRoutes
);

/* 404 */

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message:
        "API route not found."
    });
  }
);

/* START SERVER */

async function startServer() {
  try {
    await loadDocuments();

    app.listen(
      PORT,
      () => {
        console.log("");
        console.log(
          "======================================"
        );
        console.log(
          "      HR ONBOARDING AI EMPLOYEE"
        );
        console.log(
          "======================================"
        );
        console.log(
          `Server: http://localhost:${PORT}`
        );
        console.log(
          `Health: http://localhost:${PORT}/api/health`
        );
        console.log("");
      }
    );
  } catch (error) {
    console.error(
      "Server startup failed:",
      error
    );

    process.exit(1);
  }
}

startServer();