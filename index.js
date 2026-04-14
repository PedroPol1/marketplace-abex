const express = require('express');
const path = require('path')
var bodyParser = require('body-parser')
const session = require('express-session');
const app = express();

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/views'))

app.get('/home', (req, res) => {
    res.render('index');
});

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/cadastro', (req, res) => {
    
    res.render('cadastro'); 
});

app.get('/meus-anuncios', (req, res) => {
    
    res.render('meus-anuncios'); 
});


app.get('/detalhes', (req, res) => {
    
    res.render('detalhes-anuncio'); 
});

app.get('/meus-pedidos', (req, res) => {
    
    res.render('meus-pedidos'); 
});

app.get('/novo-anuncio', (req, res) => {
    
    res.render('novo-anuncio'); 
});


app.get('/sua-conta', (req, res) => {
    
    res.render('perfil'); 
});

app.get('/minhas-vendas', (req, res) => {
    
    res.render('minhas-vendas'); 
});

app.listen(5000, ()=> {
    console.log('server rodando')
})