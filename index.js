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
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// mongo connection string
const uri = process.env.DB_URL
// connection mongodb 
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const run = async()=>{
    try{
const productsCollection = client.db('laptopella').collection('products')
const usersCollection = client.db('laptopella').collection('users')
const paymentsCollection = client.db('laptopella').collection('payment')


// handle users collection

// post user data in database

app.post('/users',async(req,res)=>{
    const user = req.body
    const result =await usersCollection.insertOne(user)
    res.send(result)


   
})

// admin route
app.get('/users/admin/:email', async (req, res) => {
    const email = req.params.email;
    const query = { email }
    const user = await usersCollection.findOne(query);
    res.send({ isAdmin: user?.accountType === 'admin' });
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
    
})

// create a payment intent

app.post('/create-payment-intent',async(req,res)=>{
  const price = req.body.price.resalePrice

  const amount = price * 100

  const paymentIntent = await stripe.paymentIntents.create({
   
    currency: "usd",
    amount: amount,
   "payment_method_types": [
      "card"
 
   ]
   
  });
  res.send({
    clientSecret: paymentIntent.client_secret,
  });
})

// payment data stored in database

app.post('/payments',async(req,res)=>{
    const payment = req.body

    // inject data in payment collectioon

    const id = payment.product_id
    const filter = {_id: ObjectId(id)}
    const result = await paymentsCollection.insertOne(payment)
    const updatedDoc = {
        $set:{
            paymentStatus : true,
            transactionId: payment.transactionId
        }
    }
const updatedResult = await productsCollection.updateOne(filter, updatedDoc)
    
    res.send(result)
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