require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {
  loadDocuments,
  getSources
} = require("./services/documentService");

const chatRoutes = require("./routes/chatRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

const PORT = process.env.PORT || 5000;


/* ======================================
   CORS
====================================== */

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);


/* ======================================
   BODY PARSER
====================================== */

app.use(
  express.json({
    limit: "2mb"
  })
);


/* ======================================
   HEALTH CHECK
   Keep BEFORE document loading
====================================== */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HR Onboarding AI server is running."
  });
});


/* ======================================
   DOCUMENT INITIALIZATION
====================================== */

let documentsLoaded = false;
let loadingDocuments = null;

async function ensureDocumentsLoaded() {

  // Documents already loaded
  if (documentsLoaded) {
    return;
  }

  // If another request is already loading documents,
  // wait for the same promise.
  if (!loadingDocuments) {

    loadingDocuments = loadDocuments()
      .then(() => {

        documentsLoaded = true;

        console.log(
          "Onboarding documents loaded successfully."
        );

      })
      .catch((error) => {

        loadingDocuments = null;

        console.error(
          "Error loading onboarding documents:",
          error
        );

        throw error;
      });
  }

  await loadingDocuments;
}


/* ======================================
   DOCUMENT LOADING MIDDLEWARE
====================================== */

app.use(async (req, res, next) => {

  try {

    await ensureDocumentsLoaded();

    next();

  } catch (error) {

    console.error(
      "Document loading failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load onboarding documents.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined
    });
  }
});


/* ======================================
   DOCUMENTS API
====================================== */

app.get("/api/documents", (req, res) => {

  return res.status(200).json({
    success: true,
    documents: getSources()
  });

});


/* ======================================
   CHAT API
====================================== */

app.use(
  "/api/chat",
  chatRoutes
);


/* ======================================
   TASK API
====================================== */

app.use(
  "/api/tasks",
  taskRoutes
);


/* ======================================
   404 HANDLER
====================================== */

app.use((req, res) => {

  return res.status(404).json({
    success: false,
    message: "API route not found."
  });

});


/* ======================================
   GLOBAL ERROR HANDLER
====================================== */

app.use((error, req, res, next) => {

  console.error(
    "Server error:",
    error
  );

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : undefined
  });

});


/* ======================================
   START SERVER
====================================== */

if (require.main === module) {

  app.listen(PORT, () => {

    console.log("");

    console.log(
      "======================================"
    );

    console.log(
      "       HR ONBOARDING AI EMPLOYEE"
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

    console.log(
      `Chat: http://localhost:${PORT}/api/chat`
    );

    console.log(
      `Tasks: http://localhost:${PORT}/api/tasks`
    );

    console.log(
      "======================================"
    );

    console.log("");

  });

}


/* ======================================
   EXPORT FOR VERCEL / TESTING
====================================== */

module.exports = app;