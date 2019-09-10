const functions = require('firebase-functions');
const admin = require('firebase-admin');

// instalize express 
const express = require('express');
const app = express();

admin.initializeApp();

//  get posts from collection
app.get('/posts', (request, response) => {
    admin.firestore()
        .collection('posts')
        .orderBy('createdAt', 'desc')
        .get()
        .then((data) => {
            let posts = [];
            data.forEach(doc => {
                posts.push({
                    postId: doc.id,
                    body: doc.data().body,
                    createdAt: doc.data().createdAt
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
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    }

    admin.firestore()
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

exports.api = functions.https.onRequest(app)