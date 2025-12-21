import express from "express";
import fs from "fs/promises";

const app = express();
const PORT = process.env.PORT || 8000;
const TODOS_PATH = process.env.TODOS_PATH || "./data/todos.json";

// ==================== UTILITY FUNCTIONS ====================

const getNextId = (todos) => {
  if (!todos || todos.length === 0) {
    return 1;
  }
  let maxValue = 0;
  todos.forEach((todo) => {
    if (todo.id > maxValue) {
      maxValue = todo.id;
    }
  });
  return maxValue + 1;
};

async function fileExists(filePath) {
  try {
    await fs.access(filePath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Read todos from JSON file
 * @returns {Array} Array of todo objects
 */
const readTodos = async (path) => {
  if (!(await fileExists(path))) {
    return [];
  }
  try {
    const data = await fs.readFile(path, "utf8");
    return JSON.parse(data);
  } catch (error) {
    // If file is corrupted or empty, return empty array
    return [];
  }
};

/**
 * Write todos to JSON file
 * @param {Array} todos - Array of todo objects
 */
const writeTodos = async (todos, path) => {
  await fs.writeFile(path, JSON.stringify(todos, null, 2), "utf8");
};

// Body parser
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/", async (req, res) => {
  res.json({
    message: "Welcome to Todo List API",
    version: "1.0.0",
  });
});

app.get("/todos", async (req, res) => {
  try {
    const todosArr = await readTodos(TODOS_PATH);
    res.status(200).json({ msg: "success", data: todosArr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "error" + err.message, data: null });
  }
});

// Create todo
app.post("/todos", async (req, res) => {
  try {
    const todos = await readTodos(TODOS_PATH)
    const newTodo = {
      title: req.body.title || "default todo",
      description: req.body.description || "",
      completed: req.body.completed || false,
      id: getNextId(todos),
      created_at: new Date(),
      updated_at: new Date(),
    };
    todos.push(newTodo);
    await writeTodos(todos, TODOS_PATH);
    res.status(201).json({ msg: "success", data: req.body });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "error" + err.message, data: null });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});


// curl http://localhost:8000/hello-world