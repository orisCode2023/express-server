import express from 'express'
import fs from 'fs/promises'
import crypto from 'crypto'
import path from 'path'

const app = express()
const PORT = 3000
const __dirname = path.resolve();
const PATH = path.join(__dirname, "data", "loggin.json");
const DATA = await readUsers(PATH)

app.use(express.json())

async function readUsers(path) {
    const data = await fs.readFile(path, 'utf-8');
    return JSON.parse(data);
}


async function writeUsers(path, tasks) {
    await fs.writeFile(path, JSON.stringify(tasks, null, 2));
}

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});