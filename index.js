const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra')
const fileUpload = require('express-fileupload');
const { ObjectID } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gbfwa.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const app = express()

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(express.static('service'));
app.use(express.static('reviews'));
app.use(fileUpload());
const client = new MongoClient(uri, {
  useNewUrlParser: true, useUnifiedTopology:
    true
});
client.connect(err => {
  const serviceCollection = client.db("agency").collection("services");
  const reviewCollection = client.db("agency").collection("reviews");
  const ordersCollection = client.db("agency").collection("orders");
  const adminCollection = client.db("agency").collection("admins");
  app.post('/addServices', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const newImg = file.data;
    const enImg = newImg.toString('base64');
    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(enImg, 'base64')
    };
    serviceCollection.insertOne({ title, description, image })
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })
  app.get('/services', (req, res) => {
    serviceCollection.find({})
      .toArray((err, document) => {
        res.send(document)
      })
  })
  app.post('/addReview', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const description = req.body.description;
    const designation = req.body.designation;
    const newImg = file.data;
    const enImg = newImg.toString('base64');
    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(enImg, 'base64')
    };
    reviewCollection.insertOne({ name, description, designation, image })
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })
  app.get('/services/:id', (req, res) => {
    const id = req.params.id;
    serviceCollection.find({ _id: ObjectID(id) })
      .toArray((err, document) => {
        res.send(document[0])
        console.log(document[0])
      })
  })
  app.post('/Addorders', (req, res) => {
    const order = req.body;
    ordersCollection.insertOne(order)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })
  app.get('/orders', (req, res) => {
    ordersCollection.find({ email: req.query.email })
      .toArray((err, document) => {
        res.send(document)
      })
  })
  app.get('/orderList', (req, res) => {
    ordersCollection.find({})
      .toArray((err, document) => {
        res.send(document)
      })
  })
  app.post('/addAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.insertOne({ email })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })
  app.get('/admins', (req, res) => {
    adminCollection.find({})
      .toArray((err, document) => {
        res.send(document)
      })
  })
  app.get('/reviews', (req, res) => {
    reviewCollection.find({})
      .toArray((err, document) => {
        res.send(document)
      })
  })
  app.patch("/update/:id", (req, res) => {
    console.log(req.params.id)
    ordersCollection.updateOne({ _id: (req.params.id) },
      {
        $set: { status: req.body.status }
      }
    )
      .then(result => {
        console.log(result)
      })
  })
});
app.listen(process.env.PORT || 5000)