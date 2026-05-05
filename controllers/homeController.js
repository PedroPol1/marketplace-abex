const { db } = require('../firebase');

exports.listarHome = async (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    try {
        const produtosSnapshot = await db.collection('produtos').where('ativo', '==', true).get();
        const produtos = [];
        produtosSnapshot.forEach(doc => {
            produtos.push({ id: doc.id, ...doc.data() });
        });
        res.render('index', { user: req.session, produtos });
    } catch (error) {
        console.error("Erro ao buscar produtos para a home:", error);
        res.status(500).send("Erro interno ao carregar a página.");
    }
};
