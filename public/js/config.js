if (typeof firebase === 'undefined') throw new Error('Firebase SDK not imported');

var firebaseConfig = {
    apiKey: "apiKey",
    authDomain: "projectId.firebaseapp.com",
    databaseURL: "https://databaseName.firebaseio.com",
    projectId: "projectId",
    storageBucket: "bucket.appspot.com",
    messagingSenderId: "messagingSenderId",
    appId: "appId"
};

firebase.initializeApp(firebaseConfig);
