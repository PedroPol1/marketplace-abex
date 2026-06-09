const { db } = require('../firebase');

const wantsJson = (req) => {
    const accept = req.headers.accept || '';
    return req.xhr ||
        accept.includes('application/json') ||
        req.query.json === 'true' ||
        !accept.includes('text/html');
};

exports.criarPedido = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Você precisa estar logado para realizar uma compra!' });
    }
    try {
        const { produtoId, quantidade, formaPagamento } = req.body;
        const qty = parseInt(quantidade, 10);

        if (!produtoId || isNaN(qty) || qty <= 0 || !formaPagamento) {
            return res.status(400).json({ error: 'Dados do pedido inválidos.' });
        }

        // Buscar produto
        const produtoRef = db.collection('produtos').doc(produtoId);
        const produtoDoc = await produtoRef.get();
        if (!produtoDoc.exists) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        const produtoData = produtoDoc.data();
        if (!produtoData.ativo) {
            return res.status(400).json({ error: 'Este produto não está mais disponível para venda.' });
        }

        if (produtoData.estoque < qty) {
            return res.status(400).json({ error: `Estoque insuficiente. Quantidade disponível: ${produtoData.estoque}` });
        }

        // Buscar dados do comprador
        const compradorRef = db.collection('users').doc(req.session.userId);
        const compradorDoc = await compradorRef.get();
        if (!compradorDoc.exists) {
            return res.status(404).json({ error: 'Comprador não encontrado.' });
        }
        const compradorData = compradorDoc.data();

        const valorTotal = produtoData.preco * qty;
        const fotoUrl = (produtoData.fotos && produtoData.fotos.length > 0) ? produtoData.fotos[0].url : '/public/fotos/agro-direto.png';

        // ESTRUTURA EXATAMENTE IGUAL AO FORMATO DO SEU PRINT DO FIREBASE
        const novoPedido = {
            foto: {
                nomeNoStorage: "",
                url: fotoUrl
            },
            itens: {
                preco_unitario: produtoData.preco,
                produto_id: produtoId,
                quantidade: qty,
                titulo: produtoData.titulo
            },
            status: ["pagamento pendente"], // Salva como Array conforme o print
            total: valorTotal.toFixed(2),    // Salva como String "51.00" conforme o print
            vendedor_id: produtoData.vendedor_id,
            vendedor_nome: produtoData.vendedor_nome || '',
            comprador_id: req.session.userId,
            comprador_nome: req.session.userName || '',
            comprador_telefone: compradorData.telefone || '',
            forma_pagamento: formaPagamento,
            data_pedido: new Date()
        };

        // Salvar o pedido no banco
        const pedidoRef = await db.collection('pedidos').add(novoPedido);

        // Subtrair do estoque do produto
        await produtoRef.update({
            estoque: produtoData.estoque - qty
        });

        // Criar notificação para o vendedor (Nova Venda)
        await db.collection('notificacoes').add({
            usuario_id: produtoData.vendedor_id,
            titulo: 'Nova Venda Efetuada!',
            descricao: `Usuário <strong>${novoPedido.comprador_nome}</strong> comprou <strong>${qty}x ${produtoData.titulo}</strong>. Confirme o pagamento e prepare o produto para retirada.`,
            tipo: 'venda',
            lida: false,
            link: '/minhas-vendas',
            data: new Date()
        });

        // Criar notificação para o comprador (Pedido Realizado)
        await db.collection('notificacoes').add({
            usuario_id: req.session.userId,
            titulo: 'Pedido Realizado!',
            descricao: `Sua compra de <strong>${qty}x ${produtoData.titulo}</strong> foi registrada com sucesso.`,
            tipo: 'status_update',
            lida: false,
            link: '/meus-pedidos',
            data: new Date()
        });

        return res.status(201).json({ success: true, pedidoId: pedidoRef.id });
    } catch (error) {
        console.error("Erro ao criar pedido:", error);
        return res.status(500).json({ error: "Erro interno ao processar a compra." });
    }
};

exports.listarMinhasVendas = async (req, res) => {
    if (!req.session.userId) {
        if (wantsJson(req)) return res.status(401).json({ error: 'Não autorizado' });
        return res.redirect('/');
    }
    if (req.session.userType !== 'vendedor') {
        if (wantsJson(req)) return res.status(403).json({ error: 'Apenas vendedores podem ver suas vendas!' });
        return res.redirect('/home');
    }
    try {
        // Removido o .orderBy() para solucionar o erro de FAILED_PRECONDITION instantaneamente
        const vendasSnapshot = await db.collection('pedidos')
            .where('vendedor_id', '==', req.session.userId)
            .get();

        const vendas = [];
        vendasSnapshot.forEach(doc => {
            vendas.push({ id: doc.id, ...doc.data() });
        });

        // Ordenação realizada diretamente na memória (Mais recentes primeiro)
        vendas.sort((a, b) => {
            const dataA = a.data_pedido?.toDate ? a.data_pedido.toDate() : new Date(a.data_pedido?._seconds ? a.data_pedido._seconds * 1000 : (a.data_pedido || 0));
            const dataB = b.data_pedido?.toDate ? b.data_pedido.toDate() : new Date(b.data_pedido?._seconds ? b.data_pedido._seconds * 1000 : (b.data_pedido || 0));
            return dataB - dataA;
        });

        if (wantsJson(req)) {
            return res.json({ vendas });
        }
        res.render('minhas-vendas', { user: req.session, vendas });
    } catch (error) {
        console.error("Erro ao listar vendas:", error);
        if (wantsJson(req)) {
            return res.status(500).json({ error: "Erro interno ao carregar vendas." });
        }
        res.status(500).send("Erro interno ao carregar a página.");
    }
};

exports.listarMeusPedidos = async (req, res) => {
    if (!req.session.userId) {
        if (wantsJson(req)) return res.status(401).json({ error: 'Não autorizado' });
        return res.redirect('/');
    }
    try {
        const pedidosSnapshot = await db.collection('pedidos')
            .where('comprador_id', '==', req.session.userId)
            .get();

        const pedidos = [];
        pedidosSnapshot.forEach(doc => {
            pedidos.push({ id: doc.id, ...doc.data() });
        });

        // Ordenação em memória para evitar erros de índice no painel do cliente
        pedidos.sort((a, b) => {
            const dataA = a.data_pedido?.toDate ? a.data_pedido.toDate() : new Date(a.data_pedido?._seconds ? a.data_pedido._seconds * 1000 : (a.data_pedido || 0));
            const dataB = b.data_pedido?.toDate ? b.data_pedido.toDate() : new Date(b.data_pedido?._seconds ? b.data_pedido._seconds * 1000 : (b.data_pedido || 0));
            return dataB - dataA;
        });

        if (wantsJson(req)) {
            return res.json({ pedidos });
        }
        res.render('meus-pedidos', { user: req.session, pedidos });
    } catch (error) {
        console.error("Erro ao listar pedidos:", error);
        if (wantsJson(req)) {
            return res.status(500).json({ error: "Erro interno ao carregar pedidos." });
        }
        res.status(500).send("Erro interno ao carregar a página.");
    }
};

exports.atualizarStatus = async (req, res) => {
    if (!req.session.userId) {
        if (wantsJson(req)) return res.status(401).json({ error: 'Não autorizado' });
        return res.redirect('/');
    }
    try {
        const id = req.params.id;
        const { status } = req.body;

        const allowedStatus = ['pagamento pendente', 'retirada', 'concluido', 'cancelado'];
        if (!allowedStatus.includes(status)) {
            if (wantsJson(req)) return res.status(400).json({ error: 'Status inválido.' });
            return res.status(400).send('Status inválido.');
        }

        const pedidoRef = db.collection('pedidos').doc(id);
        const pedidoDoc = await pedidoRef.get();
        if (!pedidoDoc.exists) {
            if (wantsJson(req)) return res.status(404).json({ error: 'Pedido não encontrado.' });
            return res.status(404).send('Pedido não encontrado.');
        }

        const pedidoData = pedidoDoc.data();
        if (pedidoData.vendedor_id !== req.session.userId) {
            if (wantsJson(req)) return res.status(403).json({ error: 'Permissão negada.' });
            return res.status(403).send('Acesso negado.');
        }


        await pedidoRef.update({ status: [status] });

        // Criar notificação para o comprador sobre a mudança de status
        try {
            const qtde = (pedidoData.itens && pedidoData.itens.quantidade) ? pedidoData.itens.quantidade : (pedidoData.quantidade || 0);
            const prodTitulo = (pedidoData.itens && pedidoData.itens.titulo) ? pedidoData.itens.titulo : (pedidoData.produto_titulo || 'Produto');
            
            let notifTitulo = 'Atualização de Pedido';
            let notifDesc = `Seu pedido de <strong>${qtde}x ${prodTitulo}</strong> mudou o status para <strong>${status}</strong>.`;
            let notifTipo = 'status_update';

            if (status === 'retirada') {
                notifTitulo = 'Atualização de Pedido';
                notifDesc = `Seu pedido de <strong>${qtde}x ${prodTitulo}</strong> mudou o status para <strong>Pronto para Retirada</strong>.`;
                notifTipo = 'status_update';
            } else if (status === 'concluido') {
                notifTitulo = 'Pedido Concluído';
                notifDesc = `Parabéns! Sua compra de <strong>${qtde}x ${prodTitulo}</strong> foi finalizada com sucesso.`;
                notifTipo = 'pedido_concluido';
            } else if (status === 'cancelado') {
                notifTitulo = 'Pedido Cancelado';
                notifDesc = `Seu pedido de <strong>${qtde}x ${prodTitulo}</strong> foi cancelado pelo vendedor.`;
                notifTipo = 'status_update';
            }

            await db.collection('notificacoes').add({
                usuario_id: pedidoData.comprador_id,
                titulo: notifTitulo,
                descricao: notifDesc,
                tipo: notifTipo,
                lida: false,
                link: '/meus-pedidos',
                data: new Date()
            });
        } catch (notifErr) {
            console.error("Erro ao gerar notificação de atualização de status:", notifErr);
        }

        if (wantsJson(req)) {
            return res.json({ success: true, message: 'Status atualizado com sucesso!' });
        }
        res.redirect(303, '/minhas-vendas');
    } catch (error) {
        console.error("Erro ao atualizar status do pedido:", error);
        if (wantsJson(req)) {
            return res.status(500).json({ error: "Erro interno ao atualizar status." });
        }
        res.status(500).send("Erro interno ao atualizar status.");
    }
};