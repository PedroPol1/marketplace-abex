const { db, bucket } = require('../firebase');

const wantsJson = (req) => {
    const accept = req.headers.accept || '';
    return req.xhr ||
        accept.includes('application/json') ||
        req.query.json === 'true' ||
        !accept.includes('text/html');
};

exports.create = async (req, res) => {
    try {
        if (!req.session.userId) {
            if (wantsJson(req)) {
                return res.status(401).json({ error: 'Você precisa estar logado para criar um anúncio!' });
            }
            req.session.errorMessage = 'Você precisa estar logado para criar um anúncio!';
            return res.redirect('/');
        }

        if (req.session.userType !== 'vendedor') {
            if (wantsJson(req)) {
                return res.status(403).json({ error: 'Apenas vendedores podem criar anúncios!' });
            }
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

        const docRef = await db.collection('produtos').add(novoProduto);

        if (wantsJson(req)) {
            return res.status(201).json({ success: true, id: docRef.id, produto: novoProduto });
        }

        // Usamos status 303 (See Other) para garantir que clientes como o Insomnia redirecionem usando GET em vez de manter o POST.
        res.redirect(303, '/meus-anuncios');
    } catch (error) {
        console.error("Erro ao criar anúncio:", error);
        if (wantsJson(req)) {
            return res.status(500).json({ error: "Erro interno ao criar anúncio" });
        }
        res.status(500).send("Erro interno ao criar anúncio");
    }
};

exports.listarMeusAnuncios = async (req, res) => {
    if (!req.session.userId) {
        if (wantsJson(req)) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        return res.redirect('/');
    }
    try {
        const produtosSnapshot = await db.collection('produtos').where('vendedor_id', '==', req.session.userId).get();
        const produtos = [];
        produtosSnapshot.forEach(doc => {
            produtos.push({ id: doc.id, ...doc.data() });
        });

        if (wantsJson(req)) {
            return res.json({ produtos });
        }
        res.render('meus-anuncios', { user: req.session, produtos });
    } catch (error) {
        console.error("Erro ao buscar meus anúncios:", error);
        if (wantsJson(req)) {
            return res.status(500).json({ error: "Erro interno ao carregar anúncios." });
        }
        res.status(500).send("Erro interno ao carregar a página.");
    }
};

exports.verDetalhes = async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) {
            if (wantsJson(req)) {
                return res.status(400).json({ error: 'ID do anúncio é obrigatório' });
            }
            return res.redirect('/home');
        }

        const doc = await db.collection('produtos').doc(id).get();
        if (!doc.exists) {
            if (wantsJson(req)) {
                return res.status(404).json({ error: 'Anúncio não encontrado' });
            }
            return res.redirect('/home');
        }
        const produtoData = doc.data();
        let enderecoVendedor = produtoData.localizacao;

        if (produtoData.vendedor_id) {
            const vendedorDoc = await db.collection('users').doc(produtoData.vendedor_id).get();
            if (vendedorDoc.exists) {
                const vendedorData = vendedorDoc.data();
                if (vendedorData.dados_vendedor && vendedorData.dados_vendedor.endereco) {
                    enderecoVendedor = vendedorData.dados_vendedor.endereco;
                }
            }
        }

        const produto = { id: doc.id, endereco_vendedor: enderecoVendedor, ...produtoData };

        if (wantsJson(req)) {
            return res.json({ produto });
        }
        res.render('detalhes-anuncio', { produto, user: req.session });
    } catch (error) {
        console.error("Erro ao buscar detalhes:", error);
        if (wantsJson(req)) {
            return res.status(500).json({ error: "Erro interno ao carregar detalhes" });
        }
        res.status(500).send("Erro interno ao carregar detalhes");
    }
};

exports.renderEditar = async (req, res) => {
    if (!req.session.userId) {
        if (wantsJson(req)) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        return res.redirect('/');
    }
    try {
        const id = req.params.id;
        const doc = await db.collection('produtos').doc(id).get();
        if (!doc.exists) {
            if (wantsJson(req)) {
                return res.status(404).json({ error: 'Anúncio não encontrado' });
            }
            return res.redirect('/home');
        }
        const produto = { id: doc.id, ...doc.data() };
        if (produto.vendedor_id !== req.session.userId) {
            if (wantsJson(req)) {
                return res.status(403).json({ error: 'Acesso negado: Este anúncio não pertence a você.' });
            }
            return res.redirect('/home');
        }

        if (wantsJson(req)) {
            return res.json({ produto });
        }
        res.render('editar-anuncio', { produto, user: req.session });
    } catch (error) {
        console.error("Erro ao carregar tela de edição:", error);
        if (wantsJson(req)) {
            return res.status(500).json({ error: "Erro interno ao buscar o anúncio." });
        }
        res.status(500).send("Erro interno ao buscar o anúncio.");
    }
};

exports.editar = async (req, res) => {
    if (!req.session.userId) {
        if (wantsJson(req)) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        return res.redirect('/');
    }
    try {
        const id = req.params.id;
        const doc = await db.collection('produtos').doc(id).get();
        if (!doc.exists) {
            if (wantsJson(req)) {
                return res.status(404).json({ error: 'Anúncio não encontrado' });
            }
            return res.status(404).send("Anúncio não encontrado");
        }
        const produtoData = doc.data();
        if (produtoData.vendedor_id !== req.session.userId) {
            if (wantsJson(req)) {
                return res.status(403).json({ error: 'Acesso negado: Este anúncio não pertence a você.' });
            }
            return res.status(403).send("Acesso negado");
        }

        const titulo = req.body.titulo !== undefined ? req.body.titulo : produtoData.titulo;
        const categoria = req.body.categoria !== undefined ? req.body.categoria : produtoData.categoria;

        let preco = produtoData.preco;
        if (req.body.preco !== undefined) {
            preco = parseFloat(req.body.preco);
        }

        let estoque = produtoData.estoque;
        if (req.body.estoque !== undefined) {
            estoque = parseInt(req.body.estoque, 10);
        }

        const localizacao = req.body.localizacao !== undefined ? req.body.localizacao : produtoData.localizacao;
        const descricao = req.body.descricao !== undefined ? req.body.descricao : produtoData.descricao;

        let fotosUrls = produtoData.fotos || [];
        if (req.files && req.files.length > 0) {
            let novasFotos = [];
            for (const file of req.files) {
                const filename = `anuncios/${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                const fileUpload = bucket.file(filename);

                await fileUpload.save(file.buffer, {
                    metadata: { contentType: file.mimetype }
                });

                const [publicUrl] = await fileUpload.getSignedUrl({
                    action: 'read',
                    expires: '01-01-2100'
                });

                novasFotos.push({ nome: filename, url: publicUrl });
            }
            fotosUrls = novasFotos;
        }

        const dadosAtualizados = {
            titulo,
            categoria,
            preco,
            estoque,
            localizacao,
            descricao,
            fotos: fotosUrls,
            data_atualizacao: new Date()
        };

        await db.collection('produtos').doc(id).update(dadosAtualizados);

        if (wantsJson(req)) {
            return res.json({ success: true, message: 'Anúncio atualizado com sucesso!', produto: { id, ...dadosAtualizados } });
        }
        res.redirect(303, '/meus-anuncios');
    } catch (error) {
        console.error("Erro ao editar anúncio:", error);
        if (wantsJson(req)) {
            return res.status(500).json({ error: "Erro interno ao editar anúncio" });
        }
        res.status(500).send("Erro interno ao editar anúncio");
    }
};

exports.deletar = async (req, res) => {
    if (!req.session.userId) {
        if (wantsJson(req)) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        return res.redirect('/');
    }
    try {
        const id = req.params.id;
        const doc = await db.collection('produtos').doc(id).get();
        if (!doc.exists) {
            if (wantsJson(req)) {
                return res.status(404).json({ error: 'Anúncio não encontrado' });
            }
            return res.status(404).send("Anúncio não encontrado");
        }
        const produtoData = doc.data();
        if (produtoData.vendedor_id !== req.session.userId) {
            if (wantsJson(req)) {
                return res.status(403).json({ error: 'Acesso negado: Este anúncio não pertence a você.' });
            }
            return res.status(403).send("Acesso negado");
        }


        if (produtoData.fotos && produtoData.fotos.length > 0) {
            for (const foto of produtoData.fotos) {
                try {
                    const file = bucket.file(foto.nome);
                    await file.delete();
                } catch (err) {
                    console.error(`Erro ao deletar imagem ${foto.nome} do Storage:`, err);
                }
            }
        }

        await db.collection('produtos').doc(id).delete();

        if (wantsJson(req)) {
            return res.json({ success: true, message: 'Anúncio deletado com sucesso!' });
        }
        res.redirect(303, '/meus-anuncios');
    } catch (error) {
        console.error("Erro ao deletar anúncio:", error);
        if (wantsJson(req)) {
            return res.status(500).json({ error: "Erro interno ao deletar anúncio" });
        }
        res.status(500).send("Erro interno ao deletar anúncio");
    }
};


