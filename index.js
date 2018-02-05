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

var cookies = require("./js/cookie.js");

app.set('view engine', 'html');
app.set('views', './views');

app.engine('html', ejs.renderFile);

app.use('/styles', express.static('styles'));
app.use('/img', express.static('img'));
app.use('/scripts', express.static('scripts'));

app.use(express.urlencoded({extended: true})); // żeby przekazywać parametry POST request

var server = http.createServer(app);
var io = require('socket.io')(server);
cookies.init(io, app);

app.get('/', cookies.authorize, (req, res) => {
    res.render('app', req.user);
});

app.post('/post', (req, res) => {
    res.end(`z serwera ${new Date().toLocaleTimeString()}`);
})

app.get('/mystats', cookies.authorize, (req,res) =>{
    res.render('mystats', req.user)
});

server.listen(3000);

console.log("Server started!");

require("./js/tables.js")(io, app);
// require("/js/game.js").init(io, app);