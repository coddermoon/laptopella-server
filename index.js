// dependencies
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
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
// jsonWeb token verify


function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}

const run = async()=>{
    try{
const productsCollection = client.db('laptopella').collection('products')
const usersCollection = client.db('laptopella').collection('users')
const paymentsCollection = client.db('laptopella').collection('payment')
const ordersCollection = client.db('laptopella').collection('orders')
const wishlistCollection = client.db('laptopella').collection('wishlist')

// json web token for secure my site 
app.get('/jwt', async (req, res) => {
    const email = req.query.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    
    if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
        return res.send({ accessToken: token });
    }
    res.status(403).send({ accessToken: '' })
});



// handle users collection

// post user data in database

app.get('/allUsers', async(req,res)=>{
    const accountType = req.query.AccountType
    const query = {accountType: accountType}
    
    const result = await usersCollection.find(query).toArray()
    res.send(result)

})




app.post('/users',async(req,res)=>{
    const user = req.body
    const result =await usersCollection.insertOne(user)
    res.send(result)


   
})
app.post('/wishlist',async(req,res)=>{
    const wishlist = req.body
    const result =await wishlistCollection.insertOne(wishlist)
    console.log(result)
    res.send(result)


   
})

app.post('/products',async(req,res)=>{
    const product = req.body
    const result =await productsCollection.insertOne(product)
    res.send(result)


   
})

// find orders collection 

app.get('/orders',async(req,res)=>{
    const query = req.query
    
    const result = await ordersCollection.find(query).toArray()
    res.send(result)


})


app.get('/wishlist',async(req,res)=>{
    const email = req.query.email
    
    const query = {}
    
    const result = await wishlistCollection.find(query).toArray()
    const categoriesData = result.filter(product=>product.sellerInfo.email===email )
   
    res.send(categoriesData)


})

// admin route
app.get('/users/admin/:email', async (req, res) => {
    const email = req.params.email;
    const query = {email}
    const user = await usersCollection.findOne(query);
   const accountType = {accountType:user.accountType}

   

    res.send(accountType);
})

app.get('/seller/product/:email',  async (req, res)=>{
    const email = req.params.email;
    const query = {}
    
    const product = await productsCollection.find(query).toArray()
    const userProduct =  product.filter(pd=>pd.sellerInfo.email===email)
    
    res.send(userProduct)
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
    const categoriesData = products.map(product=>product.productInfo.brand.toLowerCase())

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
           
            sellStatus:"sold",
            
        }
       
    }
    const orders = {
        productName : payment.name,
        paymentStatus : true,
        transactionId: payment.transactionId,
        email: payment.email,
        productId : id,
        sellStatus:"sold",
        price : payment.price 
    }
    const updatedProducts = await productsCollection.updateOne(filter,updatedDoc)
const updatedResult = await ordersCollection.insertOne(orders)
    
    res.send(result)
})

app.delete('/dashboard/user/delete/:email',  async (req, res) => {
    const email = req.params.email;
    const filter = {email:email};
  
    const result = await usersCollection.deleteOne(filter);
    res.send(result);
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