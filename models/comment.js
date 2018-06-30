const mongoose = require('mongoose');

// Comment Schema
let commentSchema = mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    blog: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    commentDateTime: {
        type: Date,
        default: new Date()
    },
    isDisplay: {
        type: Number,
        default: 1
    }
});

let Comment = module.exports = mongoose.model('Comment', commentSchema);