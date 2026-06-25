const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("Erro: A variável de ambiente FIREBASE_SERVICE_ACCOUNT não é um JSON válido!", error.message);
  }
} else {
  const localChavePath = path.join(__dirname, "chave.json");
  if (fs.existsSync(localChavePath)) {
    serviceAccount = require(localChavePath);
  } else {
    console.error("Erro: Credenciais do Firebase não encontradas!");
    console.error("Certifique-se de configurar a variável de ambiente 'FIREBASE_SERVICE_ACCOUNT' no painel do Render com o conteúdo do arquivo chave.json.");
    process.exit(1); // Finaliza o processo com erro de forma limpa para sinalizar falha de config
  }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "marketplace-da363.firebasestorage.app"
});

const db = admin.firestore();
const bucket = admin.storage().bucket();
module.exports = { db, bucket };