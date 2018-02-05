// import * as http from "http" // zaremować przed uruchomieniem

/**
 * 
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse}  res 
 * @param {*} next 
 */

var token = require("./token.js");
const url = require('url');
var checkers = require('./checkers.js');
var cookie = require('./cookie.js');
var Game = checkers.Game;
var executeMove = checkers.executeMove;

function createTable(hostname, hostnick) {
    do{ id = token(); }while( TABLEDATA[id] );
    var gameclass = new Game(8, 8, 3);
    TABLEDATA[id] = {
        hostname: hostname,
        hostnick: hostnick,
        gametype: "Classic 8x8",
        hostcolor: (Math.random() < 0.5),
        hostpass: token(),
        gamefile: gameclass.toJSON()
    };
    return id;
}

function joinTable(id, guestname, guestnick) {
    if(TABLEDATA[id] && !TABLEDATA[id].guestpass) { // table exists & there is no second player yet
        TABLEDATA[id].guestpass = token();                    
        TABLEDATA[id].guestname = guestname;
        TABLEDATA[id].guestnick = guestnick;
        return true;
    } else {
        return false;
    }
}

var TABLEDATA = {
    table1_id: {
        hostname: 'sdfRambo', // nazwa użytkownika hosta
        hostnick: 'Rambo',
        hostpass: 'host#gf748238d89a9f7',
        hostsocket: 'fr23r32vgjfxr23ar',
        guestname: undefined,
        guestnick: undefined,
        guestpass: undefined,
        guestsocket: undefined,
        gametype: 'Classic 8x8', // rodzaj gry
        gamefile: undefined,
        hostcolor: true
    },
    table2_id: {
        hostname: 'xxX_69Anthony69_Xxx',
        hostnick: 'Anthony',
        hostpass: 'host#r3y89quda9dfuaf',
        hostsocket: 'rqi2h93r8h8rj',
        guestname: undefined,
        guestnick: undefined,
        guestpass: undefined,
        guestsocket: undefined,
        gametype: 'Classic 10x10',
        gamefile: undefined,
        hostcolor: undefined
    }
};

function converttables() {
    var data = {};
    for(var id in TABLEDATA) {
        data[id] = {
            hostnick: TABLEDATA[id].hostnick,
            guestnick: TABLEDATA[id].guestnick,
            //gametype: tables[id].gamefile.desc
        }
    }
    return data;
}

module.exports = function(io, app) {
    var tables = io.of('/tables');
    var games = io.of('/games');

    app.get('/tables', cookie.authorize, (req, res) => {
        res.render('tables', { nick: req.user.username, login: req.user.login });
    });

    app.post('/tables/create', (req, res) => { // creating new table
        var data = req.body;
        if(/* !data.gamedata || */ !data.hostnick) { // data incomplete
            res.send({err: 'Incomplete data'});
        } else {
            var id = createTable(data.hostnick, data.hostnick);
            res.send({ id: id, pass: TABLEDATA[id].hostpass });
            tables.emit('update-list', converttables());
        }
    });
    
    app.post('/tables/join', cookie.authorize, (req, res) => { // joining an existing table
        var id = req.body.id;
        if(joinTable(id, req.user.login, req.user.username)) {
            res.send({id: id, pass: TABLEDATA[id].guestpass });
            tables.emit('update-list', converttables());
        } else {
            res.send({err: 'Stół już jest zajęty lub nie istnieje.'});
        }
    });

    app.get('/tables/:id', (req, res) => {
        var id = req.params.id;
        var pass = req.query.p;
        if(TABLEDATA[id]) {
            if(TABLEDATA[id].hostpass == pass) {
                res.render('game', {
                    mynick: TABLEDATA[id].hostnick,
                    opponentnick: TABLEDATA[id].guestnick,
                    seat: 'host',
                    color: TABLEDATA[id].hostcolor,
                    pass: pass,
                    id: id
                });             
            } else if(TABLEDATA[id].guestpass == pass) {
                res.render('game', {
                    mynick: TABLEDATA[id].guestnick,
                    opponentnick: TABLEDATA[id].hostnick,
                    seat: 'guest',
                    color: !TABLEDATA[id].hostcolor,
                    pass: pass,
                    id: id
                });   
            } else {
                res.render('game', {
                    hostnick: TABLEDATA[id].hostnick,
                    guestnick: TABLEDATA[id].guestnick,
                    seat: 'spectator'
                });
            }
        } else {
            res.render('error', {msg: 'Szukana strona nie istnieje.'});
        }
    });

    
    /**
     *  When user connects to the 'tables' socket through:
     *      var socket = io('/table');
     *  he calls this function below with his socket
     */
    tables.on('connection', function(socket) { // TODO
        console.log("connected to tables: " + socket.id);
        socket.emit('update-list', converttables());
    });

    games.on('connection', function(socket) {
        socket.on('connect host', function(data) {
            if(TABLEDATA[data.id] && TABLEDATA[data.id].hostnick == data.nick && TABLEDATA[data.id].hostpass == data.pass) {
                TABLEDATA[data.id].hostsocket = socket;
                socket.emit('connect response', {success: true});
                socket.emit('gamestate', TABLEDATA[data.id].gamefile);
            } else {                
                socket.emit('connect response', {success: false});
            }
        });

        socket.on('connect guest', function(data) {
            if(TABLEDATA[data.id] && TABLEDATA[data.id].guestnick == data.nick && TABLEDATA[data.id].guestpass == data.pass) {
                TABLEDATA[data.id].guestsocket = socket;
                socket.emit('connect response', {success: true});
                socket.emit('gamestate', TABLEDATA[data.id].gamefile);
            } else {                
                socket.emit('connect response', {success: false});
            }

        });
        
        socket.on('move', function(data) {
            // validate move
            executeMove(TABLEDATA[data.id].gamefile, data.move);
            if(TABLEDATA[data.id].guestpass == data.pass || TABLEDATA[data.id].hostpass == data.pass) {
                console.log('success');
                TABLEDATA[data.id].hostsocket.emit('gamestate', TABLEDATA[data.id].gamefile);
                TABLEDATA[data.id].guestsocket.emit('gamestate', TABLEDATA[data.id].gamefile);
            }
        });

        socket.on('connect spectator', function(data) {

        });
    });
}
