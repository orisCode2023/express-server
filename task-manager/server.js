import express from 'express';
import fs from 'fs/promises';


const app = express();
const PORT = process.env.PORT || 3000
const PATH = process.env.TODOS_PATH || "./data/tasks.json";
const TASK_DATA = await readTasks(PATH)

app.use(express.json())

function getNextId() {
    if (TASK_DATA.length === 0) {
        return 1
    }
    let maxValue = 0
    TASK_DATA.forEach((task) => {
        if (task.id > maxValue) {
        maxValue = task.id
    }
    })
    return maxValue + 1
}

async function readTasks(path) {
    const data = await fs.readFile(path, 'utf-8');
    return JSON.parse(data);
}


async function writeTasks(path, tasks) {
    await fs.writeFile(path, JSON.stringify(tasks, null, 2));
}


app.get('/tasks', (req, res) => {
    if (!TASK_DATA) res.status(404).json({ msg: " Tasks not found ", data: null })
    else res.status(200).json({ msg: "success", data: TASK_DATA })
})


app.get('/tasks/:id', (req, res) => {
    const intId = parseInt(req.params.id)
    if (isNaN(intId)) throw new Error("not valid path param, id must be an integer")
    const foundTask = TASK_DATA.find(task => task.id === intId)
    if (!foundTask) res.status(404).json({ msg: "task not found with this id", data: null })
    else res.status(200).json({ msg: "task found succesfully", data: foundTask })
})


app.get('/task/filter', (req, res) => {
    const completed = req.query.completed
    const isCompleted = TASK_DATA.filter(task => task.completed.toString() === completed)
    if (!isCompleted) res.status(404).json({ msg: "not found", data: null })
    else res.status(200).json({ msg: "task found succesfully", data: isCompleted })
})


app.get("/taski/filter", (req, res) => {
    const priority = req.query.priority
    const highPriority = TASK_DATA.filter(task => task.priority === priority)
    if (!highPriority) res.status(404).json({ msg: "not found", data: null })
    else res.status(200).json({ msg: "task found succesfully", data: highPriority })
})


app.post('/tasks', async (req, res) => {
    const newTask = {
        id : getNextId(),
        title : req.body.title, 
        completed : false,
        priority : req.body.priority
    }
    TASK_DATA.push(newTask)
    await writeTasks(PATH, TASK_DATA)
    res.status(201).json({msg: "task added succefully", data: newTask})
})

// TODO: 6. PUT /tasks/:id - עדכון משימה
app.put("/tasksUp/:id", async (req, res) => {
    const intId = parseInt(req.params.id)
    let taskToUpdate = TASK_DATA.find(task => task.id === intId)
    taskToUpdate = {
        title: req.body.title || taskToUpdate.title,
        completed: req.body.completed || taskToUpdate.completed,
        priority: req.body.priority || taskToUpdate.priority
    }
    await writeTasks(PATH, TASK_DATA)
    res.status(200).json({msg:"user update succefully", data: taskToUpdate})
})


// TODO: 7. PATCH /tasks/:id/toggle - שינוי סטטוס completed


app.delete("/tasksD/:id", async (req, res) => {
    const intId = parseInt(req.params.id)
    if(isNaN(intId)) throw new Error ("Invalide id")
    const taskToDelete = TASK_DATA.filter(task => task.id !== intId)
    await writeTasks(PATH, taskToDelete)
    res.status(204).json({msg: "task deleted succefully", data: taskToDelete})
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
