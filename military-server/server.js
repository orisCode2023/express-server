import express from 'express'
import fs from 'fs/promises'

const app = express()
const PORT = process.env.PORT || 8000
const TARGET_PATH = process.env.TARGET_PATH || "./data/targets.json";

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`)
    next()
})

app.get("/health", async (req, res, next) => {
    res.status(200).json({ status: "ok", serverTime: "ISO_TIMESTAMP" })
})

app.get("/briefing", async (req, res, next) => {
    const headers = req.headers
    console.log(headers)
    console.log(headers["client-unit"])

    if (headers['client-unit'] !== 'Golani') {
        res.status(400).json({ msg: "You are not from this unit" });
        return
    }
    res.status(200).json({
        unit: headers["Client-Unit"],
        msg: "briefing delivered"
    })
})
async function findId(id) {
    try {
        const target = JSON.parse(await fs.readFile(TARGET_PATH, 'utf-8'))
        return target.filter(tar => tar.id === id)
    } catch (err) {
        console.log("not found")
    }
}

app.get("/targets/:id", async (req, res) => {
    const { id } = req.params
    const data = await findId(parseInt(id))
    res.status(200).json(data)
})

app.listen(PORT, () => {
    console.log(`Server ruinnig on port ${PORT}`)
})