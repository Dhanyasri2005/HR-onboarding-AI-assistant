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
    origin: true
  })
);

app.use(
  express.json({
    limit: "2mb"
  })
);

/* DOCUMENT INITIALIZATION */

let documentsLoaded = false;
let loadingDocuments = null;

async function ensureDocumentsLoaded() {
  if (documentsLoaded) {
    return;
  }

  if (!loadingDocuments) {
    loadingDocuments = loadDocuments()
      .then(() => {
        documentsLoaded = true;
      })
      .catch((error) => {
        loadingDocuments = null;
        throw error;
      });
  }

  await loadingDocuments;
}

/* LOAD DOCUMENTS BEFORE REQUESTS */

app.use(
  async (req, res, next) => {
    try {
      await ensureDocumentsLoaded();
      next();
    } catch (error) {
      console.error(
        "Document loading failed:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load onboarding documents."
      });
    }
  }
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

/* LOCAL DEVELOPMENT */

if (require.main === module) {

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
}

/* VERCEL */

module.exports = app;