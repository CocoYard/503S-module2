const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
exports.createUserDocument = functions.auth.user().onCreate((user) => {
  db.collection("users")
    .doc(user.uid)
    .set({email:user.email, name:user.displayName});
});
