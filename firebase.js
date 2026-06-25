const admin = require("firebase-admin");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("Erro ao analisar a variável de ambiente FIREBASE_SERVICE_ACCOUNT:", error);
  }
} else {
  serviceAccount = require("./chave.json");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "marketplace-da363.firebasestorage.app"
});

const db = admin.firestore();
const bucket = admin.storage().bucket();
module.exports = { db, bucket };