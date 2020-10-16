
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const fs = require('fs-extra');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()


const app = express();


app.use(cors());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.static('images'));
app.use(fileUpload());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gbfwa.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const services = client.db("creative-agency").collection("records");
  const reviews = client.db("creative-agency").collection("addService");
  const orders = client.db("creative-agency").collection("review");
  const admins = client.db("creative-agency").collection("works");;

  app.post('/addASerivceImg', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const imgName = file.name;
    const description = req.body.description;
    const serviceInfo = {
      servImg: imgName,
      servName: name,
      servDescription: description
    }
    const filePath = `${__dirname}/images/${file.name}`;

    file.mv(filePath, err => {
      if (err) {
        console.log(err)
        return res.status(500, send({ msg: 'failed to uplaod inmage to serber' }))
      } else {
        const newImg = fs.readFileSync(filePath);
        const encImg = newImg.toString('base64');
        var image = {
          contentType: req.files.file.mimetype,
          size: req.files.file.size,
          img: Buffer.from(encImg, 'base64')
        }
    
        return res.send({ name: file.name, path: `/${file.name}` });
      }
    })
  })

  app.get('/allServices', (req, res) => {
    services.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.post('/addReview', (req, res) => {
    const file = req.files.file;
    const review = {
      reviewer: req.body.reviewer,
      designation: req.body.designation,
      feedback: req.body.feedback,
      reviewerImg: file.name
    }
    file.mv(`${__dirname}/images/${file.name}`, err => {
      if (err) {
        console.log(err);
        return res.status(500, send({ msg: 'Failed to upload image to the server' }))
      } else {
        reviews.insertOne(review)
          .then((results) => {
            console.log(results)
          })
        return res.send({ name: file.name, path: `/${file.name}` })
      }
    })
  })

  app.get('/allReviews', (req, res) => {
    reviews.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/userPanel/orders/:serviceId', (req, res) => {
   
    console.log(req.params.serviceId)

    services.find({
      _id: ObjectId(req.params.serviceId)
    })
      .toArray((err, documents) => {
        res.send(documents[0])
      })

  })


  app.post('/placeOrder', (req, res) => {
    const orderInfo = req.body;
    orders.insertOne(orderInfo)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })


  app.get('/orders/:email', (req, res) => {
    const loggedInUser = req.params.email;
    orders.find({ email: loggedInUser })
      .toArray((err, documents) => {
        res.send(documents)
      })

  })


  app.patch('/updateStatus/:id', (req, res) => {
    const id = req.params.id;
    console.log(id)
    console.log(req.body.updatedStatus)
    orders.updateOne(
      { _id: ObjectId(id) },
      { $set: { status: req.body.updatedStatus } }
    )
      .then(result => {
        console.log(result)
      })
  })


  app.post('/addUserReview', (req, res) => {
    const review = req.body;
    console.log(review)
    reviews.insertOne(review)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })


  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const service = {
      servName: req.body.servName,
      servDescription: req.body.servDescription
    }
  
        const newImg = req.files.file.data;
        const encImg = newImg.toString('base64');
        var image = {
          contentType: file.mimetype,
          size: file.size,
          img: Buffer.from(encImg, 'base64')
        }
        service.image = image;
        console.log(service)
        services.insertOne(service)
          .then(result => {
         
              res.send(result.insertedCount > 0)
           
          })
      
   
  })
 
  app.get('/allOrders', (req, res) => {
    orders.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })


  app.post('/addAdmin', (req, res) => {
    const adminEmail = req.body;
    admins.insertOne(adminEmail)
      .then(result => {
        console.log(result)
      })
  })

  
  app.post('/isAdmin', (req, res) => {
    const userEmail = req.body.email;
    console.log(userEmail)
    admins.find({ email: userEmail })
      .toArray((err, documents) => {
        res.send(documents.length > 0)
      })

  })
});








app.listen (process.env.PORT || 5000, () => console.log('server running '))
