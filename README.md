# firebase-chat

This is an online web chat service working on top of Firebase Realtime Database and Firebase Authentication (GoogleAuthProvider)

## Requirements
1. Node v12.16.1
2. NPM v6.13.4

## Setup
1. Log on to [Firebase Console](https://console.firebase.google.com/) and create yourself a Web project
2. In the firebase console, navigate to authentication and add Google Authentication
3. In the firebase console, navigate to project settings and find the relevant configurations and fill up the configs in `public/js/config.js`
4. Run the app using `npm install` followed by `node index.js`
