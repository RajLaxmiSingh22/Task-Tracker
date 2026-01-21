#!/usr/bin/env node

import fs from "fs";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "tasks.json");

/* ---------- Helpers ---------- */

function initFile() {
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify([], null, 2));
  }
}

function readTasks() {
  initFile();
  return JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));
}

function writeTasks(tasks) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(tasks, null, 2));
}

function now() {
  return new Date().toISOString();
}

function nextId(tasks) {
  return tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
}

/* ---------- CLI ---------- */

const [, , command, ...args] = process.argv;
const tasks = readTasks();

switch (command) {

  case "add": {
    const description = args.join(" ").trim();
    if (!description) {
      console.log("❗ Task description cannot be empty.");
      process.exit(1);
    }

    const task = {
      id: nextId(tasks),
      description,
      status: "todo",
      createdAt: now(),
      updatedAt: now(),
    };

    tasks.push(task);
    writeTasks(tasks);
    console.log(`✅ Task added successfully (ID: ${task.id})`);
    break;
  }

  case "update": {
    const id = Number(args[0]);
    const description = args.slice(1).join(" ").trim();

    if (!id || !description) {
      console.log("❗ Usage: task-cli update <id> <description>");
      process.exit(1);
    }

    const task = tasks.find(t => t.id === id);
    if (!task) {
      console.log("❗ Task not found.");
      process.exit(1);
    }

    task.description = description;
    task.updatedAt = now();
    writeTasks(tasks);
    console.log("✅ Task updated successfully.");
    break;
  }

  case "delete": {
    const id = Number(args[0]);
    if (!id) {
      console.log("❗ Invalid task ID.");
      process.exit(1);
    }

    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      console.log("❗ Task not found.");
      process.exit(1);
    }

    tasks.splice(index, 1);
    writeTasks(tasks);
    console.log("🗑️ Task deleted successfully.");
    break;
  }

  case "mark-in-progress": {
    const id = Number(args[0]);
    const task = tasks.find(t => t.id === id);

    if (!task) {
      console.log("❗ Task not found.");
      process.exit(1);
    }

    task.status = "in-progress";
    task.updatedAt = now();
    writeTasks(tasks);
    console.log("⏳ Task marked as in progress.");
    break;
  }

  case "mark-done": {
    const id = Number(args[0]);
    const task = tasks.find(t => t.id === id);

    if (!task) {
      console.log("❗ Task not found.");
      process.exit(1);
    }

    task.status = "done";
    task.updatedAt = now();
    writeTasks(tasks);
    console.log("✅ Task marked as done.");
    break;
  }

  case "list": {
    const statusFilter = args[0];
    const filtered = statusFilter
      ? tasks.filter(t => t.status === statusFilter)
      : tasks;

    if (!filtered.length) {
      console.log("📭 No tasks found.");
      break;
    }

    console.log("📋 Task List:");
    filtered.forEach(t => {
      console.log(`[${t.id}] ${t.description} (${t.status})`);
    });
    break;
  }

  default:
    console.log(`
📌 Task Tracker CLI

Commands:
  task-cli add "Task description"
  task-cli update <id> "New description"
  task-cli delete <id>
  task-cli mark-in-progress <id>
  task-cli mark-done <id>
  task-cli list
  task-cli list todo
  task-cli list in-progress
  task-cli list done
`);
}
