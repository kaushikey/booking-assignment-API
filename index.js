const express = require('express');
const app = express();
const seatsRoute = require('./services/seats');
const mysql = require('mysql');

app.use(express.json());

app.use('/fluru', seatsRoute, ()=>{
    console.log("using Seat route");
})

app.get('/',(req,res)=>{
    res.send("<h1>Working fine :) </h1>") 
})


app.listen(5050, ()=>{
    console.log("app is working");
})
