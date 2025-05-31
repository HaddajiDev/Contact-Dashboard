const express = require("express");
const router = express.Router();

const Message = require('../models/message');


const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 requests per windowMs
    message: "Too many requests, please try again later."
});


router.post("/new", limiter, async(req, res) => {
    const {name , email, message, priority} = req.body;
    try {

        const newMsg = new Message({
            name, email, message, priority
        });

        await newMsg.save();        
        res.send("working");
    } catch (error) {
        console.log(error)
    }
});

router.get('/all', async(req, res) => {
    try {
        const messages = await Message.find();

        res.send({messages});
    } catch (error) {
        
    }
})


router.delete('/delete', async(req, res) => {
    const { id } = req.body;

    try {
        await Message.findByIdAndDelete(id);
        res.send("working");
    } catch (error) {
        console.log(error);
    }
});


router.patch("/read", async(req, res) => {
    const { id } = req.body;

    try {
        await Message.findByIdAndUpdate(id, {isRead: true});
        res.send("working");
    } catch (error) {
        console.log(error)
    }
})

router.patch("/archive", async(req, res) => {
    const { id } = req.body;

    try {
        await Message.findByIdAndUpdate(id, {isArchived : true});
        res.send("working");
    } catch (error) {
        console.log(error)
    }
})

router.patch("/star", async(req, res) => {
    const { id } = req.body;

    try {
        await Message.findByIdAndUpdate(id, {isStarred: true});
        res.send("working");
    } catch (error) {
        console.log(error)
    }
});

router.patch('/delete', async(req, res) => {
    const { id } = req.body;

    try {
        await Message.findByIdAndUpdate(id, {isDeleted: true});
        res.send("working");
    } catch (error) {
        console.log(error)
    }
});

router.patch('/restore', async(req, res) => {
    const { id } = req.body;

    try {
        await Message.findByIdAndUpdate(id, {isDeleted: false});
        res.send("working");
    } catch (error) {
        console.log(error)
    }
});


router.patch("/unarchive", async(req, res) => {
    const { id } = req.body;

    try {
        await Message.findByIdAndUpdate(id, {isArchived : false});
        res.send("working");
    } catch (error) {
        console.log(error)
    }
})

router.patch("/unstar", async(req, res) => {
    const { id } = req.body;

    try {
        await Message.findByIdAndUpdate(id, {isStarred: false});
        res.send("working");
    } catch (error) {
        console.log(error)
    }
});




module.exports = router;