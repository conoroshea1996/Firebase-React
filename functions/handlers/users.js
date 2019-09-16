const { db } = require('../util/admin');

const config = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp();

exports.SignUp = (request, response) => {
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
};
