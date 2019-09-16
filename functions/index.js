const functions = require('firebase-functions');

const { getAllPosts } = require('./handlers/posts');
const { createPost } = require('./handlers/posts');

const { SignUp } = require('./handlers/users');



// instalize express 
const express = require('express');
const app = express();



const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);


// POSTS ROUTES
//  get posts from collection
app.get('/posts', getAllPosts)
// Create post
app.post('/createpost', FBAuth, createPost);

const FBAuth = (request, response, next) => {
    let idToken;
    if (request.headers.authorization && request.headers.authorization.startsWith('Bearer ')) {
        idToken = request.headers.authorization.split('Bearer ')[1];
    } else {
        return response.status(403).json({ error: 'Unauthorized' })
    }

    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            request.user = decodedToken;
            console.log(decodedToken);
            return db.collection('users')
                .where('userId', '==', request.user.uid)
                .limit(1)
                .get();
        })
        .then(data => {
            console.log(data.docs[0].data().handle);
            request.user.handle = data.docs[0].data().handle;
            return next();
        })
        .catch(err => {
            return response.status(403).json(err)
        })

}


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
app.post('/signup', SignUp);

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
        })
        .then(token => {
            return response.json({ token });
        })
        .catch(err => {
            if (err.code === 'auth/wrong-password') {
                return response.status(403).json({ general: 'Wrong credentials , please try again' })
            } else {
                return response.status(500).json({ error: err.code });
            }
        })
})





exports.api = functions.region('europe-west1').https.onRequest(app)