require("dotenv").config();
const express = require('express');
const app = express();
const cors = require('cors');

const connect = require('./db_connect');

connect();
app.use(express.json());
app.use(cors());

app.use('/api', require('./routes/message'));


app.get("/", (req, res) => res.send("Working"));

app.listen(2000, (err) => {
    err ? console.log(err) : console.log("running on 2000")
})