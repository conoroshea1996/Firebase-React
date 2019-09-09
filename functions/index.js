const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello World!");
});

exports.getPosts = functions.https.onRequest((request, response) => {
    admin.firestore().collection('posts').get()
        .then((data) => {
            let posts = [];
            data.forEach(doc => {
                posts.push(doc.data());
            });
            return response.json(posts)
        })
        .catch(err => console.log(err))
})

exports.createPosts = functions.https.onRequest((request, response) => {

})