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

app.use(express.urlencoded({extended: true})); // żeby przekazywać parametry POST request

var server = http.createServer(app);
var io = require('socket.io')(server);

app.get('/', (req, res) => {
    res.render('test', {foo: 'qwertyuiop'});
});

app.get('/test', (req, res) => {
    res.render('test2');
})

server.listen(3000);

console.log("Server started!");


var tables = io.of('/table');
var table_data = {};
/**
 *  When user connects to the 'tables' socket through:
 *      var socket = io('/table');
 *  he calls this function below with his socket
 */
tables.on('connection', function(socket) { // TODO

    console.log(socket.id + ' connected.');

    socket.on('create-table', function(data) { // TODO
        console.log(socket.id + ': ' + data.table_data);
        console.log(data);
        socket.emit('table-id', table_id); // sending table id to it's creator
    });

    socket.on('join-table', function(data) {
        console.log('data received: ' + data);
        socket.emit('response', data + ' test');
    });

    socket.on('disconnect', function() {
        console.log(socket.id + ' disconnected.');
    });
})

var f = require('./js/token.js');

console.log(f());
console.log(f());