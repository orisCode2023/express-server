import express from "express";
import fs from "fs/promises";
import path from "path";

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT || 8000;
const TODOS_PATH = path.join(__dirname, "data", "todos.json");
// const TODOS_PATH = process.env.TODOS_PATH || __dirname + "/data/todos.json";


// ==================== UTILITY FUNCTIONS ====================

export const getNextId = (todos) => {
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
export const readTodos = async (path) => {
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
export const writeTodos = async (todos, path) => {
  await fs.writeFile(path, JSON.stringify(todos, null, 2), "utf8");
};

// =================== MIDDLEWARES ===================

// Body parser
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ================== ROUTES ===================

app.get("/", async (req, res) => {
  res.json({
    message: "Welcome to Todo List API",
    version: "1.0.0",
  });
});

// {baseUrl}/todos
// {baseUrl}/todos?completed=true
// {baseUrl}/todos?completed=false
app.get("/todos", async (req, res) => {
  try {
    const { completed } = req.query;

    const todosArr = await readTodos(TODOS_PATH);
    let filterdArr = todosArr;
    if (completed !== undefined) {
      filterdArr = todosArr.filter((todo) => String(todo.completed) === completed);
    }
    res.status(200).json({ msg: "success", data: filterdArr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "error" + err.message, data: null });
  }
});

// {baseUrl}/todos/1
app.get("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const intId = parseInt(id);
    if (isNaN(intId)) throw new Error("Invalid id, please use an integer.");
    const todos = await readTodos(TODOS_PATH);
    const todo = todos.find((t) => t.id === intId);
    if (!todo) {
      res.status(404).json({ success: false, data: {} });
    } else {
      res.status(200).json({ success: true, data: todo });
    }
  } catch (error) {
    res.status(500).json({ success: false, data: error.message });
  }
});

// {baseUrl}/todos/1
app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const intId = parseInt(id);
    if (isNaN(intId)) throw new Error("Invalid id, please use an integer.");
    const todos = await readTodos(TODOS_PATH);
    const todo = todos.find((t) => t.id === intId);
    if (!todo) {
      res.status(404).json({ success: false, data: {} });
    } else {
      todo.title = body.title || todo.title;
      todo.description = body.description || todo.description;
      todo.completed = body.completed || todo.completed;
      todo.updated_at = new Date();
      await writeTodos(todos, TODOS_PATH);
      res.status(200).json({ success: true, data: todo });
    }
  } catch (error) {
    res.status(500).json({ success: false, data: error.message });
  }
});

// {baseUrl}/todos/1
app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const intId = parseInt(id);
    if (isNaN(intId)) throw new Error("Invalid id, please use an integer.");
    const todos = await readTodos(TODOS_PATH);
    const todo = todos.find((t) => t.id === intId);
    if (!todo) {
      res.status(404).json({ success: false, data: {} });
    } else {
      const indexToDelete = todos.findIndex((t) => t.id === intId);
      todos.splice(indexToDelete, 1);
      await writeTodos(todos, TODOS_PATH);
      res.status(200).json({ success: true, data: {} });
    }
  } catch (error) {
    res.status(500).json({ success: false, data: error.message });
  }
});

// Create todo
app.post("/todos", async (req, res) => {
  try {
    const todos = await readTodos(TODOS_PATH);

    const isCompleted = req.body.completed === "true";

    const newTodo = {
      title: req.body.title || "default todo",
      description: req.body.description || "",
      completed: isCompleted,
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

// example headers
app.get("/headers-example", (req, res) => {
  const headers = req.headers;
  console.log(headers);
  if (headers["x-user-role"] === "simple-user") {
    return res.status(401).json({
      success: false,
      msg: "Simple User is Unauthorized",
    });
  } else if (headers["x-user-role"] === "admin") {
    return res.status(200).json({
      success: true,
      msg: "Admin is Authorized",
    });
  } else {
    return res.status(401).json({
      success: false,
      msg: "Unauthorized to access this resource",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});