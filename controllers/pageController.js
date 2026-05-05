const { db } = require('../firebase');

exports.renderLogin = (req, res) => {
    if (req.session.userId) return res.redirect('/home');
    res.render('login');
};

exports.renderCadastro = (req, res) => {
    if (req.session.userId) return res.redirect('/home');
    res.render('cadastro');
};

exports.renderMeusPedidos = (req, res) => {
    res.render('meus-pedidos');
};

exports.renderNovoAnuncio = (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    if (req.session.userType !== 'vendedor') {
        req.session.errorMessage = 'Acesso negado: Apenas vendedores podem criar anúncios.';
        return res.redirect('/home');
    }
    res.render('novo-anuncio');
};

exports.renderPerfil = async (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    try {
        const userDoc = await db.collection('users').doc(req.session.userId).get();
        if (!userDoc.exists) return res.redirect('/');
        res.render('perfil', { user: userDoc.data() });
    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        res.status(500).send("Erro interno ao carregar o perfil.");
    }
};

exports.renderMinhasVendas = (req, res) => {
    res.render('minhas-vendas');
};

exports.renderNotificacoes = (req, res) => {
    res.render('notificacoes');
};
