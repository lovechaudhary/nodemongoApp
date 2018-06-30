const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const fs = require('fs');


// -----------------creating multer configuration---------------
// For using File tag we have to use Multer configs
// Multer Object Creation
const multer = require('multer');
let storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, 'public/uploads/')
    },
    filename: function(req, file, callback) {
        callback(null, file.originalname);
    }
});
let upload = multer({storage: storage});
// ------------------ending multer configuration service-------------------


// Bring in User model
let User = require('../models/user');

// Register form
router.get('/register', function(req, res) {
    res.render('register');
});

// Submit Register form
router.post('/register', upload.single('pic'), function(req, res) {
    // check for validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email_address', 'Email is required').notEmpty();
    req.checkBody('email_address', 'Email is not valid').isEmail();
    req.checkBody('pwd', 'Password is required').notEmpty();
    req.checkBody('cpwd', 'Confirm password is required').notEmpty();
    req.checkBody('cpwd', 'Password do not match').equals(req.body.pwd);

    // Get Errors
    let errors = req.validationErrors();

    if(errors) {
        res.render('register', {
            errors: errors,
            name: req.body.name,
            email: req.body.email_address,
            dob: req.body.dob,
            pwd: req.body.pwd,
            cpwd: req.body.cpwd
        });
    } else {
        let user = new User();
        user.name = req.body.name;
        user.email = req.body.email_address;
        user.password = req.body.pwd;
        user.dob = req.body.dob;
        
        
        if(!req.file) {
            // no file recieve
        } else {
            user.image = req.file.originalname;
        }

        bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) {
                    console.log(err);
                }
                user.password = hash;
                
                user.save(function(err){
                    if(err) {
                        console.log(err);
                        return;
                    } else {
                        req.flash('success', 'You are now registered and can login');
                        res.redirect('/users/login');
                    }
                });
            });
        });
    }
});

// Login router
router.get('/login', function(req, res) {
    res.render('login');
});

// Login submit Router
router.post('/login', function(req, res, next) {
    // check for validation
    req.checkBody('email_address', 'Email is required').notEmpty();
    req.checkBody('email_address', 'Email is not valid').isEmail();
    req.checkBody('pwd', 'Password is required').notEmpty();

    // Get Errors
    let errors = req.validationErrors();
    
    if(errors) {
        res.render('login', {
           errors: errors,
           email: req.body.email_address,
           pwd: req.body.pwd 
        });
    } else {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/users/login',
            failureFlash: true
        })(req, res, next);
    }
});

// Logout Route
router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
});

// My profile Router
router.get('/myprofile', function(req, res) {
    res.render('my-profile', {
        data: 'hello'
    });
});

// Profile Picture Change Router
router.post('/changePic', upload.single('pic'), function(req, res) {
    let user = {};
    user.image = req.file.originalname;

    let query = {_id: req.body.user_id};    

    // update code starts here
    User.update(query, user, function(err) {
        if(err) {
            console.log(err);
            return;
        } else {
            
            // ---delete current image from /uploads folder code starts
            fs.unlink('public/uploads/'+req.body.current_pic_data, function(err){
                if(err) throw err;
                console.log('Succssfully deleted file');                
            });
            // ---delete current image file from folder code ends

            req.flash('success', 'User Image Updated');
            res.redirect('/users/myprofile');
        }
    });
});


// Edit Form Myprofile
router.get('/editMyProfile', function(req, res) {
    res.render('edit-my-profile');
});

// Edit myprofile submit Route
router.post('/editMyProfile', function(req, res) {
    // check validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email_address', 'Email is required').notEmpty();
    req.checkBody('email_address', 'Email is not valid').isEmail();
    
    let errors = req.validationErrors();
    
    let user_id = req.body.user_id;
    let query = {_id: user_id};    
    
    let data = {};

    // form data
    let user = {};
    user.name = req.body.name;
    user.email = req.body.email_address;
    user.dob = req.body.dob;

    if(errors) {
        res.render('edit-my-profile', {
            errors: errors,
            user: req.user
        });
    } else {
        // updation code
        User.update(query, user, function(err) {
            if(err) {
                console.log(err);
                return;
            } else {
                req.flash('success', 'Profile Information Updated');
                res.redirect('/users/myprofile');
            }
        });                  
    }
});

// Change password Route
router.get('/changePassword', function(req, res) {
    res.render('change-password');
});

// Change password Submit Route
router.post('/changePassword', function(req, res) {
    // check validation
    req.checkBody('old_password', 'Old password is required').notEmpty();
    req.checkBody('new_password', 'New password is required').notEmpty();
    req.checkBody('confirm_password', 'Confirm password is required').notEmpty();
    req.checkBody('confirm_password', 'Confirm/Old password do not match').equals(req.body.new_password);

    let errors = req.validationErrors();

    let user_id = req.body.user_id;
    let query = {_id: user_id}; 

    let user = {};
    user.password = req.body.new_password;

    if(errors) {
        res.render('change-password', {
            errors: errors,
            user: req.user,
            old_password: req.body.old_password,
            new_password: req.body.new_password,
            confirm_password: req.body.confirm_password
        });
    } else {
        // Match Password
        bcrypt.compare(req.body.old_password, req.user.password, function(err, isMatch) {
            if(err) throw err;
            if(!isMatch) {
                req.flash('danger', 'Old password does not match');    
                res.render('change-password', {                
                    user: req.user,
                    old_password: req.body.old_password,
                    new_password: req.body.new_password,
                    confirm_password: req.body.confirm_password
                });
            } else {
                // Update Password 
                bcrypt.genSalt(10, function(err, salt){
                    bcrypt.hash(user.password, salt, function(err, hash){
                        if(err) {
                            console.log(err);
                        }
                        user.password = hash;
                        
                        User.update(query, user, function(err) {
                            if(err) {
                                console.log(err);
                                return;                    
                            } else {
                                req.flash('success', 'Password Change Successfully');
                                res.redirect('/users/myprofile');
                            }
                        });
                    });
                });                
            }
        });
    }
});

module.exports = router;