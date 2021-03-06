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
console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
    try{
        await client.connect();
        const database = client.db('blogger');
        const usersCollection = database.collection('users');
        const postsCollection = database.collection('posts');
        const commentCollection = database.collection('comment');

        app.get('/users', async(req,res)=>{
            const page = req.query.page;
            const size = parseInt(req.query.size);
            const cursor = await usersCollection.find({});
            let result;
            const count = await cursor.count();
            if(page){
                result = await cursor.skip(page*size).limit(size).toArray();
            }
            else{
                result = await cursor.toArray();
            }
            res.json({count,result});
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
            const size = parseInt(req.query.size);
            const posts = await cursor.limit(size).toArray();
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
            const comments = req.body
            const id = req.params.id
            const filter = { _id: ObjectId(id)};
            const comment = {
                $push: {
                    comments : comments
                }
            }
            const result = postsCollection.findOneAndUpdate(filter, comment);
            res.json(result)
        })
        app.put('/posts', async(req,res)=>{
            const id = req.body.id;
            const post = req.body.post;
            const title = req.body.title;
            const filter = { _id: ObjectId(id)};
            const update = {
                $set : {
                    title: title,
                    post: post
                }
            }
            const result = postsCollection.updateOne(filter, update);
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