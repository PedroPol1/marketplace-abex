const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

router.get('/', pageController.renderLogin);
router.get('/cadastro', pageController.renderCadastro);
router.get('/novo-anuncio', pageController.renderNovoAnuncio);
router.get('/sua-conta', pageController.renderPerfil);
router.get('/notificacoes', pageController.renderNotificacoes);

module.exports = router;
