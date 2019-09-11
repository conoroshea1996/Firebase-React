// Environment Variables


const functions = require('firebase-functions');
const admin = require('firebase-admin');

require('dotenv').config();

// instalize express 
const express = require('express');
const app = express();

admin.initializeApp();

const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: "social-app-68011.firebaseapp.com",
    databaseURL: "https://social-app-68011.firebaseio.com",
    projectId: "social-app-68011",
    storageBucket: "social-app-68011.appspot.com",
    messagingSenderId: "304649285757",
    appId: "1:304649285757:web:2451cdc8405ad20a870114"
};

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

//  get posts from collection
app.get('/posts', (request, response) => {
    db
        .collection('posts')
        .orderBy('createdAt', 'desc')
        .get()
        .then((data) => {
            let posts = [];
            data.forEach(doc => {
                posts.push({
                    postId: doc.id,
                    body: doc.data().body,
                    createdAt: doc.data().createdAt,
                    likeCount: doc.data().likeCount,
                    commentCount: doc.data().commentCount
                });
            });
            return response.json(posts)
        })
        .catch(err => console.log(err))
})

// Create post
app.post('/createpost', (request, response) => {
    const newPost = {
        body: request.body.body,
        userHandle: request.body.userHandle,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0
    }

    db
        .collection('posts')
        .add(newPost)
        .then(doc => {
            response.json({
                message: `document ${doc.id} was created`,
                user: ` created by ${newPost.userHandle}`
            });
        })
        .catch(err => console.log(err));
});




// Sign up route 
app.post('/signup', (request, response) => {
    const newUser = {
        email: request.body.email,
        password: request.body.password,
        confirmPassword: request.body.confirmPassword,
        handle: request.body.handle
    };

    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if (doc.exists) {
                return response.status(400).json({ handle: 'this handle is already taken' })
            }
            else {
                return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
                    .then(data => {
                        return response.status(201).json({ 'message': `user ${data.user.uid} has been created` })
                    })
                    .catch(err => console.log(err))
            }
        })
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return response.status(201).json(token)
        })
        .catch(err => {
            console.log(err);
            return response.status(500).json({ error: err });
        })

})


exports.api = functions.region('europe-west1').https.onRequest(app)