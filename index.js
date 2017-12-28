// import * as http from "http" // zaremować przed uruchomieniem

/**
 * 
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse}  res 
 * @param {*} next 
 */
const http = require('http');
const ejs = require('ejs');
const express = require('express'); 
//const checkers = require('./checkers.js');

var app = express();

app.set('view engine', 'html');
app.set('views', './views');

app.engine('html', ejs.renderFile);

app.use('/styles', express.static('styles'));
app.use('/img', express.static('img'));
app.use('/scripts', express.static('scripts'));

app.get('/', (req, res) => {
    res.render('app');
});

app.get('/game', (req, res) => {
    res.render('game');
})

app.post('/post', (req, res) => {
    res.end(`z serwera ${new Date().toLocaleTimeString()}`);
})

http
    .createServer(app)
    .listen(3000);

console.log("Server started!");