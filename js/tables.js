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
var gameState = checkers.gamestate;

function createTable(hostlogin, hostname) {
    do{ id = token(); }while( TABLEDATA[id] );
    var gameclass = new Game(8, 8, 3);
    TABLEDATA[id] = {
        hostlogin: hostlogin,
        hostname: hostname,
        gametype: "Classic 8x8",
        hostcolor: (Math.random() < 0.5),
        hostpass: token(),
        gamefile: gameclass.toJSON()
    };
    return id;
}

function joinTable(id, guestlogin, guestname) {
    if(TABLEDATA[id] && !TABLEDATA[id].guestpass) { // table exists & there is no second player yet
        TABLEDATA[id].guestpass = token();                    
        TABLEDATA[id].guestlogin = guestlogin;
        TABLEDATA[id].guestname = guestname;
        return true;
    } else {
        return false;
    }
}

var TABLEDATA = {
    table1_id: {
        hostlogin: 'sdfRambo', // nazwa użytkownika hosta
        hostname: 'Rambo',
        hostpass: 'host#gf748238d89a9f7',
        hostsocket: 'fr23r32vgjfxr23ar',
        guestlogin: undefined,
        guestname: undefined,
        guestpass: undefined,
        guestsocket: undefined,
        gametype: 'Classic 8x8', // rodzaj gry
        gamefile: undefined,
        hostcolor: true
    },
    table2_id: {
        hostlogin: 'xxX_69Anthony69_Xxx',
        hostname: 'Anthony',
        hostpass: 'host#r3y89quda9dfuaf',
        hostsocket: 'rqi2h93r8h8rj',
        guestlogin: undefined,
        guestname: undefined,
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
            hostname: TABLEDATA[id].hostname,
            guestname: TABLEDATA[id].guestname,
            //gametype: tables[id].gamefile.desc
        }
    }
    return data;
}

module.exports = function(io, app) {
    var tables = io.of('/tables');
    var games = io.of('/games');

    app.get('/tables', cookie.authorize, (req, res) => {
        res.render('tables');
    });

    app.post('/tables/create', cookie.authorize, (req, res) => { // creating new table
        if(/* !data.gamedata || */ false) { // data incomplete
            res.send({err: 'Incomplete data'});
        } else {
            var id = createTable(req.user.login, req.user.username);
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
                    mynick: TABLEDATA[id].hostname,
                    opponentnick: TABLEDATA[id].guestname,
                    seat: 'host',
                    color: TABLEDATA[id].hostcolor,
                    pass: pass,
                    id: id
                });             
            } else if(TABLEDATA[id].guestpass == pass) {
                res.render('game', {
                    mynick: TABLEDATA[id].guestname,
                    opponentnick: TABLEDATA[id].hostname,
                    seat: 'guest',
                    color: !TABLEDATA[id].hostcolor,
                    pass: pass,
                    id: id
                });   
            } else {
                res.render('game', {
                    mynick: TABLEDATA[id].hostname,
                    opponentnick: TABLEDATA[id].guestname,
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
            if(TABLEDATA[data.id] && TABLEDATA[data.id].hostname == data.name && TABLEDATA[data.id].hostpass == data.pass) {
                TABLEDATA[data.id].hostsocket = socket;
                socket.emit('connect response', {success: true});
                socket.emit('gamestate', TABLEDATA[data.id].gamefile);
            } else {
                socket.emit('connect response', {success: false});
            }
        });

        socket.on('connect guest', function(data) {
            if(TABLEDATA[data.id] && TABLEDATA[data.id].guestname == data.name && TABLEDATA[data.id].guestpass == data.pass) {
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
            var state = getState(TABLEDATA[data.id].gamefile);
            if(state.finished) {
                if(state.won == TABLEDATA[data.id].hostcolor) {
                    // host won
                    TABLEDATA[data.id].hostsocket.emit('game-end', true);
                    TABLEDATA[data.id].guestsocket.emit('game-end', false);
                } else {
                    // guest won
                    TABLEDATA[data.id].hostsocket.emit('game-end', false);
                    TABLEDATA[data.id].guestsocket.emit('game-end', true);
                }
            }
            if(TABLEDATA[data.id].guestpass == data.pass || TABLEDATA[data.id].hostpass == data.pass) {
                TABLEDATA[data.id].hostsocket.emit('gamestate', TABLEDATA[data.id].gamefile);
                TABLEDATA[data.id].guestsocket.emit('gamestate', TABLEDATA[data.id].gamefile);
            }
        });

        socket.on('connect spectator', function(data) {

        });
    });
}
