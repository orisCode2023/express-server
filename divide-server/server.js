import express from "express";
import path from "path";
import todos from "./routes/todos.js"
import exampleHeaders from "./routes/example-headers.js"
import dotenv from 'dotenv';



const app = express();
const PORT = process.env.PORT || 8000;
const __dirname = path.resolve();
const TODOS_PATH = path.join(__dirname, "data", "todos.json");
// const TODOS_PATH = process.env.TODOS_PATH || __dirname + "/data/todos.json";


// =================== MIDDLEWARES ===================
dotenv.config({path: ".env"})
console.log(process.env.PORT)
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
app.use ('/todos', todos)
app.use ('/headers-example', exampleHeaders)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
});