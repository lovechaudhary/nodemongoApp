const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

// Database Setup
mongoose.connect(config.database);
let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('We are connected to Database');
});


// Init App
const app = express();

// Load View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));


// Body parser middleware 
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())


// Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;
        
        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
    
        return {
            param: formParam,
            msg: msg,
            value: value   
        };
    }
}));


// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    next();
});

// const post_data = [
//     {
//         title: 'Find the way to Loop',
// 	    category:	'Programming',
//         description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
//         author: 'Love Chaudhary',
//         datetime: 'Friday, May 4, 2018: 7:28PM'	    
//     },
//     {
//         title: 'How to desgin in pug',
// 	    category:	'Desiging',
//         description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
//         author: 'Love Chaudhary',
//         datetime: 'Friday, May 2, 2018: 5:22PM'
//     }
// ];

// Bring Blog Model
let Blog = require('./models/blog');
let Category = require('./models/category');
let User = require('./models/user');

// routing
app.get('/', function(req, res){
    Blog.find({}, function(err, blogs) {
        if(err) {
            console.log(err);
            return;
        } else {            
            res.render('index', {
                title: 'Welcome to Tech Blog',
                post: blogs
            });      
        }
    })
});

// Routes files
let users = require('./routes/users');
let blogs = require('./routes/blogs');
let comments = require('./routes/comments');
app.use('/users', users);
app.use('/blogs', blogs);
app.use('/comments', comments);


// Server Listining
app.listen(3000, function(){
    console.log('Server started on port 3000');
});