// dependencies
const { MongoClient, ServerApiVersion } = require('mongodb');
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


       
    }finally{

    }
}
run().catch((err)=>console.error(err.message))

app.get('/', (req, res) => {
    res.send('running server');
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})