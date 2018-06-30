let mongoose = require('mongoose');

// Blog Schema
let blogSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    dateTime: {
        type: Date,
        default: new Date()
    },
    isDisplay: {
        type: Number,
        default: 1
    }
});

let Blog = module.exports = mongoose.model('Blog', blogSchema);