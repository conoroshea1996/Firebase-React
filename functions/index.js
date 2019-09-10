const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello World!");
});

//  get posts from collection
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


// Create post
exports.createPosts = functions.https.onRequest((request, response) => {
    if (request.method !== 'POST') {
        return response.status(400).json({ error: 'Metod not allowed' })
    }
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