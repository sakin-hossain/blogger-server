const express = require('express')
const app = express()
const port = process.env.port || 5000
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const fileUpload = require('express-fileupload');

app.use(cors())
app.use(express.json())
app.use(fileUpload())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tqbro.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
    try{
        await client.connect();
        const database = client.db('blogger');
        const usersCollection = database.collection('users');
        const postsCollection = database.collection('posts');

        app.get('/users', async(req,res)=>{
            const result = await usersCollection.find({}).toArray()
            res.json(result);
        })

        app.post('/users', async(req,res)=>{
            const name = req.body.name;
            const email = req.body.email;
            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');
            const user = {
                name,
                email,
                image: imageBuffer
            }
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })

        app.post('/posts', async(req,res)=>{
            const post = req.body;
            const result = await postsCollection.insertOne(post);
            res.json(result);
        })

        app.get('/posts', async(req,res)=>{
            const posts = await postsCollection.find({}).toArray();
            res.json(posts);
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello welcome to Blogger world')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})