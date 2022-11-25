// dependencies
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');

const port = process.env.PORT || 5000

require('dotenv').config()
const app = express();
// middlewares
app.use(cors());
app.use(express.json());

// mongo connection string
const uri = process.env.DB_URL
// connection mongodb 
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const run = async()=>{
    try{
const productsCollection = client.db('laptopella').collection('products')
const usersCollection = client.db('laptopella').collection('users')


// handle users collection

// post user data in database

app.post('/users',async(req,res)=>{
    const user = req.body
    const result =await usersCollection.insertOne(user)
    res.send(result)


   
})


app.get('/products',async(req,res)=>{
    const query = {}
    const products = await productsCollection.find(query).toArray()
    res.send(products)
})

// find product with specific id
app.get(`/products/:id`,async(req,res)=>{
    const id = req.params.id
    const query = {_id:ObjectId(id)}
    const product = await productsCollection.findOne(query)
    res.send(product)
})
// fetch to category
app.get(`/category`,async(req,res)=>{
    
    const query = {}
    const products = await productsCollection.find(query).toArray()
    const categoriesData = products.map(product=>product.productInfo.brand)

   res.send(categoriesData)
    return
})

       
    }finally{

    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('running server');
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})