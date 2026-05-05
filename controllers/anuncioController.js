const { db, bucket } = require('../firebase');

exports.create = async (req, res) => {
    try {
        if (!req.session.userId) {
            req.session.errorMessage = 'Você precisa estar logado para criar um anúncio!';
            return res.redirect('/');
        }
        
        if (req.session.userType !== 'vendedor') {
            req.session.errorMessage = 'Apenas vendedores podem criar anúncios!';
            return res.redirect('/home');
        }

        const { titulo, categoria, preco, estoque, localizacao, descricao } = req.body;
        
        let fotosUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const filename = `anuncios/${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                const fileUpload = bucket.file(filename);
                
                await fileUpload.save(file.buffer, {
                    metadata: { contentType: file.mimetype }
                });
                
                // Gerar URL assinada válida por 100 anos para garantir o acesso público
                const [publicUrl] = await fileUpload.getSignedUrl({
                    action: 'read',
                    expires: '01-01-2100'
                });
                
                fotosUrls.push({ nome: filename, url: publicUrl });
            }
        }

        const novoProduto = {
            titulo,
            categoria,
            preco: parseFloat(preco),
            estoque: parseInt(estoque, 10),
            localizacao,
            descricao,
            vendedor_id: req.session.userId,
            vendedor_nome: req.session.userName,
            ativo: true,
            data_criacao: new Date(),
            fotos: fotosUrls
        };

        await db.collection('produtos').add(novoProduto);
        
        res.redirect('/meus-anuncios');
    } catch (error) {
        console.error("Erro ao criar anúncio:", error);
        res.status(500).send("Erro interno ao criar anúncio");
    }
};

exports.listarMeusAnuncios = async (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    try {
        const produtosSnapshot = await db.collection('produtos').where('vendedor_id', '==', req.session.userId).get();
        const produtos = [];
        produtosSnapshot.forEach(doc => {
            produtos.push({ id: doc.id, ...doc.data() });
        });
        res.render('meus-anuncios', { user: req.session, produtos });
    } catch (error) {
        console.error("Erro ao buscar meus anúncios:", error);
        res.status(500).send("Erro interno ao carregar a página.");
    }
};

exports.verDetalhes = async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) return res.redirect('/home');
        
        const doc = await db.collection('produtos').doc(id).get();
        if (!doc.exists) {
            return res.redirect('/home');
        }
        const produtoData = doc.data();
        let enderecoVendedor = produtoData.localizacao; // fallback
        
        if (produtoData.vendedor_id) {
            const vendedorDoc = await db.collection('users').doc(produtoData.vendedor_id).get();
            if (vendedorDoc.exists) {
                const vendedorData = vendedorDoc.data();
                if (vendedorData.dados_vendedor && vendedorData.dados_vendedor.endereco) {
                    enderecoVendedor = vendedorData.dados_vendedor.endereco;
                }
            }
        }

        res.render('detalhes-anuncio', { produto: { id: doc.id, endereco_vendedor: enderecoVendedor, ...produtoData }, user: req.session });
    } catch (error) {
        console.error("Erro ao buscar detalhes:", error);
        res.status(500).send("Erro interno ao carregar detalhes");
    }
};
