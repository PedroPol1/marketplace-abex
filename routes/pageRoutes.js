const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

router.get('/', pageController.renderLogin);
router.get('/cadastro', pageController.renderCadastro);
router.get('/meus-pedidos', pageController.renderMeusPedidos);
router.get('/novo-anuncio', pageController.renderNovoAnuncio);
router.get('/sua-conta', pageController.renderPerfil);
router.get('/minhas-vendas', pageController.renderMinhasVendas);
router.get('/notificacoes', pageController.renderNotificacoes);

module.exports = router;
