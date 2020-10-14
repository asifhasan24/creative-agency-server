const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gbfwa.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;



const app = express()

app.use(bodyParser.json());
app.use(cors());
// app.use(express.static('doctors'));
// app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})
const client = new MongoClient(uri, { useNewUrlParser: true ,useUnifiedTopology: true});
client.connect(err => {
  const appointmentCollection  = client.db("creative-agency").collection("records");

  app.post('/addAppointment', (req, res) => {
      const all = req.body
  
    
   appointmentCollection.insertOne(all)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
})
});

app.listen(process.env.PORT || port)