const express = require('express');
const url = require('url');
const router = express.Router();

// Bring Models
let Comment = require('../models/comment');
let Blog = require('../models/blog');
let User = require('../models/user');
let Category = require('../models/category');

// save comment Router
router.post('/save', ensureAuthenticated, function(req, res) {
    let blog_id = req.body.blog_id;

    // comment data
    let comment = new Comment();
    comment.author = req.user._id;
    comment.blog = blog_id;
    comment.comment = req.body.comment;

    comment.save(function(err) {
        if(err) {
            console.log(err);
            return;
        } else {
            req.flash('success', 'Comment Added successfully');
            res.redirect('/blogs/selection/'+blog_id);
        }
    });
});

function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        let url = req.url;
        req.flash('danger', 'Please Login');
        res.redirect('/users/login');
    }
}

module.exports = router;