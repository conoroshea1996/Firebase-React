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


const isEmail = (email) => {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regex)) {
        return true;
    } else {
        return false;
    }
}

const isEmpty = (string) => {
    if (string.trim() === '') {
        return true;
    } else {
        return false;
    };
};


// Sign up route 
app.post('/signup', (request, response) => {
    const newUser = {
        email: request.body.email,
        password: request.body.password,
        confirmPassword: request.body.confirmPassword,
        handle: request.body.handle
    };

    let errors = {};

    //  User validtion 
    if (isEmpty(newUser.email)) {
        errors.email = 'Email must not be empty';
    } else if (!isEmail(newUser.email)) {
        errors.email = 'Email is not valid format';
    }

    if (isEmpty(newUser.password)) {
        errors.password = 'Password must not be empty';
    }
    if (newUser.password !== newUser.confirmPassword) {
        errors.confirmPassword = 'Password must Match';
    }

    if (isEmpty(newUser.handle)) {
        errors.handle = 'handle must not be empty';
    }

    if (Object.keys(errors).length > 0) {
        return response.status(400).json(errors);
    }

    let token, userId;
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if (doc.exists) {
                return response.status(400).json({ handle: 'this handle is already taken' })
            }
            else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        })
        .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then(tokenId => {
            token = tokenId;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() => {
            return response.status(201).json({ token })
        })
        .catch(err => {
            if (err.code === "auth/email-already-in-use") {
                return response.status(400).json({ error: 'Email already in use' })
            } else {
                return response.status(500).json({ error: err.code });
            }
        })
})

// Login Route
app.post('/login', (request, response) => {
    const user = {
        email: request.body.email,
        password: request.body.password
    }

    let errors = {};

    if (isEmpty(user.email)) {
        errors.email = 'Must not be empty';
    }
    if (isEmpty(user.password)) {
        errors.password = 'Must not be empty';
    }

    if (Object.keys(errors).length > 0) {
        return response.status(400).json(errors)
    }

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        }).then(token => {
            return response.json({ token, login: true });
        }).catch(err => {
            return response.status(500).json({ error: err.code });
        })
})





exports.api = functions.region('europe-west1').https.onRequest(app)