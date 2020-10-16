const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs=require('fs-extra')
const {ObjectID} = require('mongodb')

const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gbfwa.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


app.use(cors());
app.use(express.static('servicve'));
app.use(fileUpload());

const port = 5000;
app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const appointmentCollection = client.db("creative-agency").collection("records");
    const addServiceCollection = client.db("creative-agency").collection("addService");
    const reviewCollection = client.db("creative-agency").collection("review");
    const makeAdmin = client.db("creative-agency").collection("works");

    app.post('/addAppointment', (req, res) => {
        const all = req.body
        appointmentCollection.insertOne(all)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
    app.post('/makeadmin', (req, res) => {
        const allAdmin = req.body
        makeAdmin.insertOne(allAdmin)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/service/:id',(req,res)=>{
        const id=req.params.id;
        addServiceCollection.find({_id:ObjectID(id)})
        .toArray((err,document)=>{
          res.send(document[0])
        })  
       })



       app.post('/addReview', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const cname = req.body.cname;
        const description = req.body.description;
        const filePath=`${__dirname}/service/${file.name}`
        file.mv(filePath,err=>{
            if(err){
              console.log(err)
               res.status(500).send({msg:'failed'});
            }
            const newImg=fs.readFileSync(filePath);
            const enImg=newImg.toString('base64');
            var image={
              contentType:req.files.file.mimetype,
              size:req.files.file.size,
              img:Buffer(enImg,'base64')
            };

        reviewCollection.insertOne({ name, cname,  description, image })
        .then(result=>{
            fs.remove(filePath,error=>{
              if(error){
                res.status(500).send({msg:'failed'})
              }
              res.send(result.insertedCount>0);
            })
          })
    
        })
      })

    

    app.get('/adddata',(req,res)=>{
        addServiceCollection.find({})
            .toArray((err,document)=>{
              res.send(document)
            })  
           })

           app.get('/addrev',(req,res)=>{
            reviewCollection.find({})
                .toArray((err,document)=>{
                  res.send(document)
                })  
               })
  

       app.post('/addService', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const filePath=`${__dirname}/service/${file.name}`
        file.mv(filePath,err=>{
            if(err){
              console.log(err)
               res.status(500).send({msg:'failed'});
            }
            const newImg=fs.readFileSync(filePath);
            const enImg=newImg.toString('base64');
            var image={
              contentType:req.files.file.mimetype,
              size:req.files.file.size,
              img:Buffer(enImg,'base64')
            };

        addServiceCollection.insertOne({ name, email, image })
        .then(result=>{
            fs.remove(filePath,error=>{
              if(error){
                res.status(500).send({msg:'failed'})
              }
              res.send(result.insertedCount>0);
            })
          })
    
        })
      })






});

app.listen(process.env.PORT || port)