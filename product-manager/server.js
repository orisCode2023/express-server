import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();
const PRODUCTS_PATH = path.join(__dirname, "data", "products.json");
const DATA = await readProducts(PRODUCTS_PATH)

app.use(express.json());

const maxId = DATA.length > 0 ? Math.max(...DATA.map(item => item.id)) : 0;
const newId = maxId + 1;

async function readProducts(path) {
    const data = await fs.readFile(path, 'utf-8');
    return JSON.parse(data);
}
async function writeProducts(path, products) {
    await fs.writeFile(path, JSON.stringify(products, null, 2));
}
app.get('/products', (req, res) => {
    if (DATA) res.status(200).json({ msg: "success", data: DATA })
    else res.status(404).json({ msg: "not found", data: null })
})

app.get('/productsId/:id', (req, res) => {
    const intId = parseInt(req.params.id)
    if (isNaN(intId)) throw new Error("Invalid, id must be a number")
    const getProduct = DATA.find(product => product.id === intId)
    if (!getProduct) res.status(404).json({ msg: "not found", data: null })
    else res.status(200).json({ msg: "success", data: getProduct })
})

app.post('/productsAdd', async (req, res) => {
    const newProduct = {}
    Object.assign(newProduct, { id: newId, ...req.body })
    DATA.push(newProduct)
    await writeProducts(PRODUCTS_PATH, DATA)
    res.status(200).json({ msg: "product added", data: newProduct })
})

app.put('/productsUpdate/:id', async (req, res) => {
    const intId = parseInt(req.params.id)
    if (isNaN(intId)) throw new Error("Invalid, Id must be an integer")
    const findProduct = DATA.find(product => product.id === intId)
    if (findProduct.length === 0) res.status(404).json({ msg: "product not found", data: null })
    findProduct.name = req.body.name || findProduct.name
    findProduct.price = req.body.price || findProduct.price
    findProduct.catagory = req.body.catagory || findProduct.catagory
    findProduct.stock = req.body.stock || findProduct.stock
    await writeProducts(PRODUCTS_PATH, DATA)
    res.status(200).json({ msg: "product updated", data: findProduct })

})

app.delete('/productsDelete/:id', async (req, res) => {
    const intId = parseInt(req.params.id)
    if (isNaN(intId)) throw new Error("Invalid, Id must be an integer")
    const findProduct = DATA.filter(product => product.id !== intId)
    if (findProduct.length === 0) res.status(404).json({ msg: "product not found", data: null })
    else await writeProducts(PRODUCTS_PATH, findProduct)
    res.status(204).json({ msg: "product was deleted", data: findProduct })
})

app.get('/productsCatagory/search', (req, res) => {
    const findCatagory = DATA.filter(product => product.category === req.query.category)
    if (findCatagory.length === 0) res.status(404).json({ msg: "product not found", data: null })
    else res.status(200).json({ msg: "success", data: findCatagory })
})

app.get('/productsPrice/search', (req, res) => {
    const findPrice = DATA.filter(product => product.price > req.query.minPrice && product.price < req.query.maxPrice)
    if (findPrice.length === 0) res.status(404).json({ msg: "product not found", data: null })
    else res.status(200).json({ msg: "success", data: findPrice })
})

app.get('/productsName/search', (req, res) => {
    const findName = DATA.filter(product => product.name === req.query.name)
    if (findName.length === 0) res.status(404).json({ msg: "product not found", data: null })
    else res.status(200).json({ msg: "success", data: findName })
})

app.patch("/productsUpStock/:id/stock", async (req, res) => {
    const intId = parseInt(req.params.id)
    if (isNaN(intId)) throw new Error("Invalid, Id must be an integer")
    const findProduct = DATA.find(product => product.id === intId)
    if (findProduct.length === 0) res.status(404).json({ msg: "product not found", data: null })
    console.log(req.body.amount)
    if (req.body.amount > 0) findProduct.stock += req.body.amount
    else findProduct.stock -= req.body.amount
    await writeProducts(PRODUCTS_PATH, DATA)
    res.status(200).json({ msg: "update success", data: findProduct })

})


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});