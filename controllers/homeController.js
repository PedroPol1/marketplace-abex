const { db } = require('../firebase');

const wantsJson = (req) => {
    const accept = req.headers.accept || '';
    return req.xhr || 
           accept.includes('application/json') || 
           req.query.json === 'true' || 
           !accept.includes('text/html');
};

exports.listarHome = async (req, res) => {
    if (!req.session.userId) {
        if (wantsJson(req)) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        return res.redirect('/');
    }
    try {
        const { search, category } = req.query;

        const normalizeText = (text) => {
            if (!text) return '';
            return text
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim();
        };

        const searchNormalized = normalizeText(search);
        const categoryNormalized = normalizeText(category);

        const produtosSnapshot = await db.collection('produtos').where('ativo', '==', true).get();
        const produtos = [];
        produtosSnapshot.forEach(doc => {
            const data = doc.data();
            
            // Ocultar produtos que pertencem ao usuário logado
            if (data.vendedor_id === req.session.userId) {
                return;
            }

            // Filtrar por categoria
            if (categoryNormalized) {
                const prodCat = normalizeText(data.categoria);
                if (prodCat !== categoryNormalized) {
                    return;
                }
            }

            // Filtrar por termo de pesquisa
            if (searchNormalized) {
                const prodTitle = normalizeText(data.titulo);
                if (!prodTitle.includes(searchNormalized)) {
                    return;
                }
            }

            produtos.push({ id: doc.id, ...data });
        });

        if (wantsJson(req)) {
            return res.json({ produtos });
        }
        res.render('index', { user: req.session, produtos, search: search || '', category: category || '' });
    } catch (error) {
        console.error("Erro ao buscar produtos para a home:", error);
        if (wantsJson(req)) {
            return res.status(500).json({ error: "Erro interno ao carregar a home." });
        }
        res.status(500).send("Erro interno ao carregar a página.");
    }
};

