const express = require('express');
const router = express.Router();

// Bring Models
let Blog = require('../models/blog');
let Category = require('../models/category');
let User = require('../models/user');
let Comment = require('../models/comment');

// Add Blog Router
router.get('/add', ensureAuthenticated, function(req, res) {
    Category.find({}, function(err, categorys) {
        if(err) {
            console.log(err);
            return;
        } else {
            res.render('blogs/add-blog', {
                categorys: categorys
            });
        }
    });    
});

// Blog Posting Route
router.post('/add', function(req, res) {
    // check validation
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('category', 'Category is required').notEmpty();
    req.checkBody('desc', 'Description is required').notEmpty();

    let errors = req.validationErrors();
    
    if(errors) {
        Category.find({}, function(err, categorys){ 
            res.render('blogs/add-blog', {
                errors: errors,
                title: req.body.title,
                category_selected: req.body.category,
                desc: req.body.desc,
                categorys: categorys,
                user: req.user
            });
        });
        
    } else {
        
        // Save Blog Form data
        let blog = new Blog();
        blog.title = req.body.title;
        blog.category = req.body.category;
        blog.description = req.body.desc;
        blog.author = req.user._id;
        
        blog.save(function(err) {
            if(err) {
                console.log(err);
                return;
            } else {
                req.flash('success', 'Blog is Posted on Wall Successfully');
                res.redirect('/');
            }
        });
    }
});

// Display data of Blog Route
router.get('/selection/:id', function(req, res) {
    let cmt_user_data;
    Blog.findById({_id: req.params.id}, function(err, blog) {
        User.findById({_id: blog.author}, function(err, user) {
            Category.findById({_id: blog.category}, function(err, cat) {
                Comment.find({blog: blog._id}, function(err, comments) {
                    for(let i=0; i < comments.length; i++) {
                        User.findById({_id: comments[i].author}, function(err, cmt_author) {
                            res.render('blogs/show-blog', {
                                blog: blog,
                                author: user.name,
                                category: cat.name,
                                comments: comments,
                                comment_author: cmt_author
                            });    
                        }); 
                    }
                    // User.findById({_id: comments.author}, function(err, cmt_author) {
                        
                    // });                    
                });                
            });
        });
    });
});

// Access Control
function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

module.exports = router;