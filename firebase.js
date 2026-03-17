const admin = require("firebase-admin");

let serviceAccount;


    serviceAccount = require("./chave.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "marketplace-da363.firebasestorage.app"
});

const db = admin.firestore();
const bucket = admin.storage().bucket();
module.exports = { db, bucket };