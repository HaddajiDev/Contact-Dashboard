const mongoose = require("mongoose");

const URI = process.env.URI;

async function connect() {
    try {
        await mongoose.connect(URI, {
            dbName: "Contact",
        })
    
        console.log("Connected to mongo");
    } catch (error) {
        console.log(error);
    }
}

module.exports = connect;