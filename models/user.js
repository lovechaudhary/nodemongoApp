let mongoose = require('mongoose');

// User Schema
let userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
	dob: {
        type: String        
    },
	image: {
        type: String
    },
    profile_created: {
        type: Date,
        default: new Date()
    },
	isdislay: {
        type: Number,
        default: 1
    }
});

let User = module.exports = mongoose.model('User', userSchema);