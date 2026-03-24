const express = require('express');
const path = require('path')
var bodyParser = require('body-parser')
const session = require('express-session');
const app = express();

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/views'))

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(5000, ()=> {
    console.log('server rodando')
})

app.get('/detalhes', (req, res) => {
    
    res.render('detalhes-anuncio'); 
});