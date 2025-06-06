require("dotenv").config();
const express = require('express');
const app = express();
const cors = require('cors');

const connect = require('./db_connect');

connect();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000", "https://haddaji.vercel.app", "https://contact-dashboard-front.vercel.app"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', "PATCH"],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range']
}));

app.use('/api', require('./routes/message'));


app.get("/", (req, res) => res.send("Working"));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
  
    next();
  });
  

app.listen(2000, (err) => {
    err ? console.log(err) : console.log("running on 2000")
})