import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { getNextId } from '../divide-server/utils/todosStorage'

const app = express()
const PORT = process.env.PORT || 3000
const __dirname = path.resolve()
const USER_PATH = path.join(__dirname, "data", "users.json");
const POST_PATH = path.join(__dirname, "data", "posts.json");
const USER_DATA = await readFile(USER_PATH)
const POST_DATA = await readFile(POST_PATH)


app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const getNextId = (data) => {
  if (!data || data.length === 0) {
    return 1;
  }
  let maxValue = 0;
  data.forEach((d) => {
    if (d.id > maxValue) {
      maxValue = d.id;
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

const writeFile = async (path, data) => {
  await fs.writeFile(path, JSON.stringify(data, null, 2), "utf8");
};

const readFile = async (path) => {
  if (!(await fileExists(path))) {
    return [];
  }
  try {
    const data = await fs.readFile(path, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

async function validateUser(username, password){
    const findUsername = USER_DATA.find(user => user.username === username && user.password === password)
    return findUsername || null
}


app.get('/', (res, req) => {
    res.status(200).json({ message: "Welcome to Simple Auth API" })
})

app.post('/register', async (req, res) => {
    const { username, email, password} = req.body
    const isExist = USER_DATA.find(user => user.username === username)
    if (isExist) res.status(400).json({msg: "user already exist with this username"})
    else {
        const newUser = {
            id: getNextId(USER_DATA),
            username,
            email,
            password
        }
        USER_DATA.push(newUser)
        await writeFile(USER_PATH, USER_DATA)
        const { password: _, ...userResponse } = newUser;
        res.status(201).json({msg: "user added succefully", data: userResponse})
    }
})


app.get('/posts', (res, req) => {
    res.status(200).json({data: POST_DATA})
})

app.get('/users', (res, req) => {
    res.status(200).json({data: USER_DATA})
})