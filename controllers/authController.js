const { db } = require('../firebase');

const wantsJson = (req) => {
    const accept = req.headers.accept || '';
    return req.xhr || 
           accept.includes('application/json') || 
           req.query.json === 'true' || 
           !accept.includes('text/html');
};

exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;
        const userSnapshot = await db.collection('users').where('email', '==', email).where('senha', '==', senha).get();

        if (userSnapshot.empty) {
            if (wantsJson(req)) {
                return res.status(401).json({ success: false, error: 'E-mail ou senha incorretos!' });
            }
            req.session.errorMessage = 'E-mail ou senha incorretos!';
            return res.redirect('/');
        }

        const userData = userSnapshot.docs[0].data();
        req.session.userId = userSnapshot.docs[0].id;
        req.session.userType = userData.tipo;
        req.session.userName = userData.nome;

        if (wantsJson(req)) {
            return res.json({
                success: true,
                user: {
                    id: req.session.userId,
                    nome: req.session.userName,
                    tipo: req.session.userType
                }
            });
        }

        res.redirect('/home');
    } catch (error) {
        console.error("Erro no login:", error);
        if (wantsJson(req)) {
            return res.status(500).json({ success: false, error: "Erro interno ao fazer login." });
        }
        res.status(500).send("Erro interno ao fazer login.");
    }
};

exports.cadastro = async (req, res) => {
    try {
        const { 'tipo-conta': tipoConta, nome, email, telefone, nome_propriedade, endereco, chave_pix, senha } = req.body;

        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        if (!userSnapshot.empty) {
            if (wantsJson(req)) {
                return res.status(400).json({ success: false, error: 'E-mail já cadastrado!' });
            }
            req.session.errorMessage = 'E-mail já cadastrado!';
            return res.redirect('/cadastro');
        }

        const newUser = {
            tipo: tipoConta,
            nome,
            email,
            telefone,
            senha,
            fotoPerfil: null
        };

        if (tipoConta === 'vendedor') {
            newUser.dados_vendedor = {
                'chave-pix': chave_pix || "",
                endereco: endereco || "",
                'nome-propriedade': nome_propriedade || ""
            };
        }

        const docRef = await db.collection('users').add(newUser);

        req.session.userId = docRef.id;
        req.session.userType = tipoConta;
        req.session.userName = nome;

        if (wantsJson(req)) {
            return res.status(201).json({
                success: true,
                user: {
                    id: req.session.userId,
                    nome: req.session.userName,
                    tipo: req.session.userType
                }
            });
        }

        res.redirect('/home');
    } catch (error) {
        console.error("Erro no cadastro:", error);
        if (wantsJson(req)) {
            return res.status(500).json({ success: false, error: "Erro interno ao cadastrar." });
        }
        res.status(500).send("Erro interno ao cadastrar.");
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            if (wantsJson(req)) {
                return res.status(500).json({ success: false, error: 'Erro ao fazer logout' });
            }
            return res.redirect('/');
        }
        if (wantsJson(req)) {
            return res.json({ success: true, message: 'Logout efetuado com sucesso' });
        }
        res.redirect('/');
    });
};

