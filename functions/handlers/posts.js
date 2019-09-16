const { db } = require('../util/admin');

// Gets all post from collection
exports.getAllPosts = (request, response) => {
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
}

// Create a post 
exports.createPost = (request, response) => {
    const newPost = {
        body: request.body.body,
        userHandle: request.user.handle,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0
    }
    console.log(newPost);

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
};