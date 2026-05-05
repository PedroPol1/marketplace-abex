const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const anuncioController = require('../controllers/anuncioController');

router.post('/anuncios', upload.array('fotos', 5), anuncioController.create);
router.get('/meus-anuncios', anuncioController.listarMeusAnuncios);
router.get('/detalhes', anuncioController.verDetalhes);

module.exports = router;
