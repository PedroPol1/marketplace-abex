const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const anuncioController = require('../controllers/anuncioController');

router.post('/anuncios', upload.array('fotos', 5), anuncioController.create);
router.get('/meus-anuncios', anuncioController.listarMeusAnuncios);
router.get('/detalhes', anuncioController.verDetalhes);


router.get('/anuncios/editar/:id', anuncioController.renderEditar);
router.post('/anuncios/editar/:id', upload.array('fotos', 5), anuncioController.editar);
router.put('/anuncios/:id', upload.array('fotos', 5), anuncioController.editar);


router.post('/anuncios/deletar/:id', anuncioController.deletar);
router.delete('/anuncios/:id', anuncioController.deletar);

module.exports = router;

