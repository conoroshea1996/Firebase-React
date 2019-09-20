const functions = require('firebase-functions');

const { getAllPosts, createPost } = require('./handlers/posts');

const { SignUp, login, uploadImage } = require('./handlers/users');

const FBAuth = require('./util/FBAuth');


// instalize express
const app = require('express')();

// POSTS
//  get posts from collection
app.get('/posts', getAllPosts)
// Create post
app.post('/createpost', FBAuth, createPost);



// USERS
// Sign up route
app.post('/signup', SignUp);
// Login Route
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);

exports.api = functions.region('europe-west1').https.onRequest(app)