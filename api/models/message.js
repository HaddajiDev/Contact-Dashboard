const mongoose = require('mongoose');

const messageModel = new mongoose.Schema({
    name:{type: String, required: true},
    email:{type: String, required: true},
    message:{type: String, required: true},
    timestamp: {type: Date, default: Date.now()},
    isRead: {type: Boolean, default: false},
    isStarred: {type: Boolean, default: false},
    isArchived: {type: Boolean, default: false},
    isDeleted: {type: Boolean, default: false},
    priority: {type: String, required: true},
});

module.exports = mongoose.model('message', messageModel);