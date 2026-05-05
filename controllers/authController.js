const { db } = require('../firebase');

exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;
        const userSnapshot = await db.collection('users').where('email', '==', email).where('senha', '==', senha).get();
        
        if (userSnapshot.empty) {
            req.session.errorMessage = 'E-mail ou senha incorretos!';
            return res.redirect('/');
        }

        const userData = userSnapshot.docs[0].data();
        req.session.userId = userSnapshot.docs[0].id;
        req.session.userType = userData.tipo;
        req.session.userName = userData.nome;

        res.redirect('/home');
    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).send("Erro interno ao fazer login.");
    }
};

exports.cadastro = async (req, res) => {
    try {
        const { 'tipo-conta': tipoConta, nome, email, telefone, nome_propriedade, endereco, chave_pix, senha } = req.body;
        
        // Verifica se o email já existe
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        if (!userSnapshot.empty) {
            req.session.errorMessage = 'E-mail já cadastrado!';
            return res.redirect('/cadastro');
        }

        const newUser = {
            tipo: tipoConta,
            nome,
            email,
            telefone,
            senha, // Em um ambiente real, deve-se criptografar a senha!
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
        
        // Autentica o usuário recém-criado
        req.session.userId = docRef.id;
        req.session.userType = tipoConta;
        req.session.userName = nome;

        res.redirect('/home');
    } catch (error) {
        console.error("Erro no cadastro:", error);
        res.status(500).send("Erro interno ao cadastrar.");
    }
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};
