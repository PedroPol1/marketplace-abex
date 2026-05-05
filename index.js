const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

const authRoutes = require('./routes/authRoutes');
const anuncioRoutes = require('./routes/anuncioRoutes');
const homeRoutes = require('./routes/homeRoutes');
const pageRoutes = require('./routes/pageRoutes');

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/views'));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({ secret: 'minha_chave_secreta_agro', resave: false, saveUninitialized: true }));

app.use((req, res, next) => {
    res.locals.errorMessage = req.session.errorMessage;
    res.locals.sessionUser = req.session;
    req.session.errorMessage = null;
    next();
});

app.use('/', authRoutes);
app.use('/', anuncioRoutes);
app.use('/', homeRoutes);
app.use('/', pageRoutes);

app.listen(5000, () => {
    console.log('server rodando')
})