// Importing Libraries
const express = require("express");
const app = express();
require('dotenv').config();
const port = process.env.PORT || 4000;
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
// const logger = require('morgan');
const morgan = require('morgan');

// Declaring Global Constants
global.ROLES = ['admin', 'employee'];
global.PRIORITY = ['low', 'mid', 'high'];

// Listing Custom imports
const HttpError = require('./models/httpError')
const userRoute = require('./routes/userRoute')
const ticketsRoute = require('./routes/ticketRoute')

// // Mogoose Connection
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.iu28p.mongodb.net/${process.env.DB_NAME}`)
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection Error!!:'));
db.once('open', function() {
    console.log("Connected to Database :)");
});

// Default Middlewares
app.use(bodyParser.json());
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
    next();
})



var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

// setup the logger
// app.use(morgan('combined', { stream: accessLogStream }))

// Logs requests
// app.use(morgan(':remote-addr :url :method HTTP/:http-version :user-agent', {
//     // https://github.com/expressjs/morgan#immediate
//     immediate: true,
//     stream: accessLogStream
//   }));
  
  // Logs responses
app.use(morgan(':method :url :status :res[content-length] :response-time ms :res[header]', {
    stream: accessLogStream
  }));
app.use(morgan(':method :url :status :res[content-length] :response-time ms :res[header]'))


// app.use(logger('tiny', {
//     stream: fs.createWriteStream('./access.log', {flags: 'a'})
// }));
// app.use(logger('tiny'));

// Listing Routes Here
app.use('/users', userRoute);
app.use('/tickets', ticketsRoute);


app.use((req, res, next)=>{
    throw new HttpError('Unknown Route!!! This route is not supported. ',404);
});

app.use((error, req, res, next) =>{
    if(res.headerSent){
        return next(error);
    }else{
        console.log(error.message);
        res.status(error.code || 500);
        res.json({message: error.message || 'Unknown Error!!! Something went wrong.'})
    }
});

app.listen(port, ()=>{
    console.log(`Server is running at ${port}`);
})