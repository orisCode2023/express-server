import express from 'express'
import fs from 'fs/promises'
import path from 'path';

const app = express();
const PORT = 3000;
const PATH = "./users.json";
const USERS_DATA = await readJson(PATH);


// make the path realative from anywhere             
//  const __dirname = path.resolve()
// handele the path when the data in subfolder
// const PATH2 = process.env.PATH2 || path.join(__dirname, "folder", "json file name.json");


// use to convert the client body input into json
// its name is body parser
app.use(express.json());

async function readJson(path) {
    return JSON.parse(await fs.readFile(path, 'utf-8'));
};

async function writeJson(path, data){
    await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
};

const getNextId = (users) => {
  if (!USERS_DATA || USERS_DATA.length === 0) {
    return 1;
  }
  let maxValue = 0;
  users.forEach((user) => {
    if (user.id > maxValue) {
      maxValue = user.id;
    }
  });
  return maxValue + 1;
};

app.get('/users', async (req, res) => {
    try {
        if (!USERS_DATA) res.status(404).json({ msg: "not found" + err.message, result: null });
        else res.status(200).json({ msg: "success", result: USERS_DATA });
    } catch (err) {
        console.error(err);
}});

app.get('/users/search', async (req, res) => {
    try {
        const { city } = req.query;
        const filteredUsers = USERS_DATA.filter(userObg => userObg.city === city)
        if(filteredUsers.length > 0) res.status(200).json(filteredUsers)
        else res.status(404).json({ message: "users not found with this city"})
    } catch (err) {
        console.error(err)
    }
});

app.get('/users/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const user = USERS_DATA.find(userObj => userObj.id === id)
    if (!user) res.status(404).json({ message: 'User not found' });
    else res.status(200).json(user)
});

app.post('/users', async (req, res) => {
    const newUser = {
        id: getNextId(USERS_DATA),
        name: req.body.name || "jhon do",
        age: req.body.age || 0,
        city: req.body.city || null,
    }
    USERS_DATA.push(newUser) 
    await writeJson(PATH, USERS_DATA)
    res.status(201).json({msg: "new user was created succefully", data: newUser})
});

app.put('/users/:id', async (req, res) => {
    const id = req.params.id
    const foundUser = USERS_DATA.find(user => user.id === id)
    foundUser["id"] = req.body.id
    await writeJson(PATH, newUser)

})





app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))