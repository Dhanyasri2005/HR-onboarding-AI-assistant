const express = require("express");
const fs = require("fs");
const path = require("path");

const {
  searchDocuments
} = require("../services/documentService");

const {
  generateAnswer
} = require("../services/aiService");

const router = express.Router();

const TASKS_FILE = path.join(
  __dirname,
  "..",
  "data",
  "tasks.json"
);

function readTasks() {
  if (!fs.existsSync(TASKS_FILE)) {
    return [];
  }

  try {
    return JSON.parse(
      fs.readFileSync(
        TASKS_FILE,
        "utf8"
      )
    );
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  fs.writeFileSync(
    TASKS_FILE,
    JSON.stringify(
      tasks,
      null,
      2
    ),
    "utf8"
  );
}

function isTaskCreation(message) {
  const text =
    message.toLowerCase();

  return (
    text.includes("create a task") ||
    text.includes("create task") ||
    text.includes("add a task") ||
    text.includes("add task") ||
    text.includes("make a task") ||
    text.includes("remind me to")
  );
}

function extractTaskTitle(message) {
  let title =
    message.trim();

  const patterns = [
    /^create\s+(?:a\s+)?task\s+(?:to|for)\s+/i,
    /^create\s+(?:a\s+)?task\s*:\s*/i,
    /^add\s+(?:a\s+)?task\s+(?:to|for)\s+/i,
    /^add\s+(?:a\s+)?task\s*:\s*/i,
    /^make\s+(?:a\s+)?task\s+(?:to|for)\s+/i,
    /^remind\s+me\s+to\s+/i
  ];

  for (const pattern of patterns) {
    if (pattern.test(title)) {
      title = title.replace(
        pattern,
        ""
      );

      break;
    }
  }

  title = title
    .replace(/[.!?]+$/, "")
    .trim();

  if (!title) {
    title =
      "Complete onboarding task";
  }

  return (
    title.charAt(0).toUpperCase() +
    title.slice(1)
  );
}

function createTask(title) {
  const tasks = readTasks();

  const task = {
    id:
      `TASK-${Date.now()
        .toString()
        .slice(-6)}`,

    title,

    status: "Pending",

    createdAt:
      new Date().toISOString()
  };

  tasks.push(task);

  saveTasks(tasks);

  return task;
}

function isTaskQuestion(message) {
  const text =
    message.toLowerCase();

  return (
    text.includes("my task") ||
    text.includes("my tasks") ||
    text.includes("task status") ||
    text.includes("status of my task") ||
    text.includes("onboarding task") ||
    text.includes("onboarding tasks")
  );
}

function findMatchingTask(
  message,
  tasks
) {
  const words =
    message
      .toLowerCase()
      .replace(
        /[^a-z0-9\s]/g,
        " "
      )
      .split(/\s+/)
      .filter(
        (word) => word.length > 3
      );

  let bestTask = null;
  let bestScore = 0;

  for (const task of tasks) {
    const titleWords =
      task.title
        .toLowerCase()
        .replace(
          /[^a-z0-9\s]/g,
          " "
        )
        .split(/\s+/)
        .filter(
          (word) => word.length > 3
        );

    let score = 0;

    for (const word of titleWords) {
      if (words.includes(word)) {
        score++;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestTask = task;
    }
  }

  return bestTask;
}

/* CHAT */

router.post("/", async (req, res) => {
  try {
    const {
      message,
      history = []
    } = req.body;

    if (
      !message ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Message is required."
      });
    }

    const userMessage =
      message.trim();

    const tasks = readTasks();

    /* TASK CREATION */

    if (
      isTaskCreation(
        userMessage
      )
    ) {
      const title =
        extractTaskTitle(
          userMessage
        );

      const task =
        createTask(title);

      return res.json({
        success: true,
        type: "task_created",

        answer:
          `Done! I've created the onboarding task "${task.title}". Its current status is "${task.status}".`,

        task,

        sources: []
      });
    }

    /* TASK STATUS */

    if (
      isTaskQuestion(
        userMessage
      ) &&
      tasks.length > 0
    ) {
      const matchingTask =
        findMatchingTask(
          userMessage,
          tasks
        );

      if (matchingTask) {
        return res.json({
          success: true,
          type: "task_status",

          answer:
            `The task "${matchingTask.title}" is currently "${matchingTask.status}".`,

          task: matchingTask,

          sources: []
        });
      }

      const taskText =
        tasks
          .map(
            (task) =>
              `• ${task.title} — ${task.status}`
          )
          .join("\n");

      return res.json({
        success: true,
        type: "task_status",

        answer:
          `Here are your current onboarding tasks:\n\n${taskText}`,

        tasks,

        sources: []
      });
    }

    /* DOCUMENT SEARCH */

    const matches =
      searchDocuments(
        userMessage,
        4
      );

    const context =
      matches.length > 0
        ? matches
            .map(
              (item, index) =>
                `SOURCE ${index + 1}: ${item.source}\n${item.content}`
            )
            .join("\n\n")
        : "";

    /* GEMINI */

    const answer =
      await generateAnswer({
        message:
          userMessage,

        history,

        context,

        tasks
      });

    const sources = [
      ...new Set(
        matches.map(
          (item) =>
            item.source
        )
      )
    ];

    res.json({
      success: true,
      type: "answer",
      answer,
      sources
    });
  } catch (error) {
    console.error(
      "Chat error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Something went wrong while processing your request."
    });
  }
});

module.exports = router;