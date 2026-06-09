const { db } = require('../firebase');

const wantsJson = (req) => {
    const accept = req.headers.accept || '';
    return req.xhr ||
        accept.includes('application/json') ||
        req.query.json === 'true' ||
        !accept.includes('text/html');
};

exports.renderLogin = (req, res) => {
    if (req.session.userId) {
        if (wantsJson(req)) {
            return res.json({ success: true, message: "Já está logado", redirect: "/home" });
        }
        return res.redirect('/home');
    }
    if (wantsJson(req)) {
        return res.json({ success: true, message: "Página de Login" });
    }
    res.render('login');
};

exports.renderCadastro = (req, res) => {
    if (req.session.userId) {
        if (wantsJson(req)) {
            return res.json({ success: true, message: "Já está logado", redirect: "/home" });
        }
        return res.redirect('/home');
    }
    if (wantsJson(req)) {
        return res.json({ success: true, message: "Página de Cadastro" });
    }
    res.render('cadastro');
};

exports.renderMeusPedidos = (req, res) => {
    if (wantsJson(req)) {
        return res.json({ success: true, message: "Página de Meus Pedidos" });
    }
    res.render('meus-pedidos');
};

exports.renderNovoAnuncio = (req, res) => {
    if (!req.session.userId) {
        if (wantsJson(req)) {
            return res.status(401).json({ error: "Você precisa estar logado!" });
        }
        return res.redirect('/');
    }
    if (req.session.userType !== 'vendedor') {
        if (wantsJson(req)) {
            return res.status(403).json({ error: "Acesso negado: Apenas vendedores podem acessar." });
        }
        req.session.errorMessage = 'Acesso negado: Apenas vendedores podem criar anúncios.';
        return res.redirect('/home');
    }
    if (wantsJson(req)) {
        return res.json({ success: true, message: "Página de Novo Anúncio" });
    }
    res.render('novo-anuncio');
};

exports.renderPerfil = async (req, res) => {
    if (!req.session.userId) {
        if (wantsJson(req)) {
            return res.status(401).json({ error: "Não autorizado" });
        }
        return res.redirect('/');
    }
    try {
        const userDoc = await db.collection('users').doc(req.session.userId).get();
        if (!userDoc.exists) {
            if (wantsJson(req)) {
                return res.status(404).json({ error: "Usuário não encontrado" });
            }
            return res.redirect('/');
        }
        const userData = userDoc.data();
        if (wantsJson(req)) {
            return res.json({ user: userData });
        }
        res.render('perfil', { user: userData });
    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        if (wantsJson(req)) {
            return res.status(500).json({ error: "Erro interno ao carregar o perfil." });
        }
        res.status(500).send("Erro interno ao carregar o perfil.");
    }
};

exports.renderMinhasVendas = (req, res) => {
    if (wantsJson(req)) {
        return res.json({ success: true, message: "Página de Minhas Vendas" });
    }
    res.render('minhas-vendas');
};

exports.renderNotificacoes = async (req, res) => {
    if (!req.session.userId) {
        if (wantsJson(req)) {
            return res.status(401).json({ error: "Você precisa estar logado!" });
        }
        return res.redirect('/');
    }
    try {
        const notificationsSnapshot = await db.collection('notificacoes')
            .where('usuario_id', '==', req.session.userId)
            .get();

        const notificacoes = [];
        notificationsSnapshot.forEach(doc => {
            notificacoes.push({ id: doc.id, ...doc.data() });
        });

        // Ordenar por data decrescente (mais recente primeiro)
        notificacoes.sort((a, b) => {
            const dataA = a.data?.toDate ? a.data.toDate() : new Date(a.data?._seconds ? a.data._seconds * 1000 : (a.data || 0));
            const dataB = b.data?.toDate ? b.data.toDate() : new Date(b.data?._seconds ? b.data._seconds * 1000 : (b.data || 0));
            return dataB - dataA;
        });

        if (wantsJson(req)) {
            return res.json({ notificacoes });
        }

        res.render('notificacoes', { user: req.session, notificacoes });

        // Marcar todas como lidas de forma assíncrona
        const batch = db.batch();
        let hasUnread = false;
        notificationsSnapshot.forEach(doc => {
            if (!doc.data().lida) {
                batch.update(doc.ref, { lida: true });
                hasUnread = true;
            }
        });
        if (hasUnread) {
            batch.commit().catch(err => console.error("Erro ao marcar notificações como lidas:", err));
        }

    } catch (error) {
        console.error("Erro ao carregar notificações:", error);
        if (wantsJson(req)) {
            return res.status(500).json({ error: "Erro interno ao carregar notificações." });
        }
        res.status(500).send("Erro interno ao carregar a página.");
    }
};

