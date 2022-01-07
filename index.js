const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();
const { MongoClient, Db } = require('mongodb');
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectId;
const { ObjectID } = require('bson');

app.use(cors())
app.use(express.json())
app.use(fileUpload())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tqbro.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
    try{
        await client.connect();
        const database = client.db('blogger');
        const usersCollection = database.collection('users');
        const postsCollection = database.collection('posts');
        const commentCollection = database.collection('comment');

        app.get('/users', async(req,res)=>{
            const users = await usersCollection.find({}).toArray()
            res.json(users);
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

        app.get('/users/:email', async(req,res)=>{
            const userEmail = req.params.email;
            const filter = {email : userEmail};
            const result = await usersCollection.findOne(filter);
            res.send(result);
        })

        app.post('/posts', async(req,res)=>{
            const post = req.body;
            const result = await postsCollection.insertOne(post);
            res.json(result);
        })

        app.get('/posts', async(req,res)=>{
            const cursor = await postsCollection.find({});
            const size = req.query.size;
            let posts;
            if(size){
                posts = await cursor.limit(size).toArray();
            }
            else{
                posts = await cursor.toArray();
            }
            res.json(posts);
        })

        app.get('/posts/:email', async(req,res)=>{
            const postEmail = req.params.email;
            const filter = {email: postEmail};
            const result = await postsCollection.find(filter).toArray();
            res.json(result);
        })

        app.get('/post/:id',async(req,res)=>{
            const query = { _id: ObjectId(req.params.id)}
            const post = await postsCollection.findOne(query);
            res.send(post);
        })
        app.delete('/post/:id', async(req,res)=>{
            const query = { _id: ObjectId(req.params.id)};
            const result = await postsCollection.deleteOne(query);
            res.json(result);
        })
        app.put('/post/:id', async(req,res)=>{
            const post = req.body;
            const filter = { _id: ObjectId(req.params.id)};
            const options = { upsert: true };
            const updated = {$set:post}
            const result = await usersCollection.updateOne(filter, updated, options);
            res.json(result);
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