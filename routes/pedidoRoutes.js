const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

router.post('/pedidos', pedidoController.criarPedido);
router.get('/meus-pedidos', pedidoController.listarMeusPedidos);
router.get('/minhas-vendas', pedidoController.listarMinhasVendas);
router.post('/pedidos/:id/status', pedidoController.atualizarStatus);
router.put('/pedidos/:id/status', pedidoController.atualizarStatus);

module.exports = router;
