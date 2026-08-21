const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const DATA_DIR = path.join(
  __dirname,
  "..",
  "data"
);

const TASKS_FILE = path.join(
  DATA_DIR,
  "tasks.json"
);

function ensureTaskFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {
      recursive: true
    });
  }

  if (!fs.existsSync(TASKS_FILE)) {
    fs.writeFileSync(
      TASKS_FILE,
      "[]",
      "utf8"
    );
  }
}

function readTasks() {
  ensureTaskFile();

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
  ensureTaskFile();

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

/* GET ALL TASKS */

router.get("/", (req, res) => {
  res.json({
    success: true,
    tasks: readTasks()
  });
});

/* CREATE TASK */

router.post("/", (req, res) => {
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message:
        "Task title is required."
    });
  }

  const tasks = readTasks();

  const task = {
    id:
      `TASK-${Date.now()
        .toString()
        .slice(-6)}`,

    title: title.trim(),

    status: "Pending",

    createdAt:
      new Date().toISOString()
  };

  tasks.push(task);

  saveTasks(tasks);

  res.status(201).json({
    success: true,
    message:
      "Task created successfully.",
    task
  });
});

/* UPDATE TASK */

router.patch("/:id", (req, res) => {
  const { status } = req.body;

  const allowedStatuses = [
    "Pending",
    "In Progress",
    "Completed"
  ];

  if (
    !allowedStatuses.includes(status)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid task status."
    });
  }

  const tasks = readTasks();

  const taskIndex =
    tasks.findIndex(
      (task) =>
        task.id === req.params.id
    );

  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Task not found."
    });
  }

  tasks[taskIndex].status =
    status;

  saveTasks(tasks);

  res.json({
    success: true,
    message:
      "Task updated successfully.",
    task: tasks[taskIndex]
  });
});

module.exports = router;