const functions = require('firebase-functions');

const { getAllPosts } = require('./handlers/posts');
const { createPost } = require('./handlers/posts');

const { SignUp, login } = require('./handlers/users');

const FBAuth = require('./util/FBAuth');


// instalize express 
const express = require('express');
const app = express();

//  get posts from collection
app.get('/posts', getAllPosts)
// Create post
app.post('/createpost', FBAuth, createPost);
// Sign up route 
app.post('/signup', SignUp);
// Login Route
app.post('/login', login);

exports.api = functions.region('europe-west1').https.onRequest(app)