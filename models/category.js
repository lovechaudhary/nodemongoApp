let mongoose = require('mongoose');

// Category Schema
let categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    isDisplay: {
        type: Number,
        default: 1
    }
});

let Category = module.exports = mongoose.model('Category', categorySchema);