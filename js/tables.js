// import * as http from "http" // zaremować przed uruchomieniem

/**
 * 
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse}  res 
 * @param {*} next 
 */

var token = require("./token.js");
const url = require('url');
var Game = require('./checkers.js').Game;

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

function initGame(id) {
    var gameclass = new Game(8, 8, 3);
    gameclass.hostnick = TABLEDATA[id].hostnick;
    gameclass.guestnick = TABLEDATA[id].guestnick;
    return gameclass.toJSON;
}

module.exports = {
    init : function(io, app) {
        var tables = io.of('/tables');
        var games = io.of('/games');

        app.get('/tables', (req, res) => {
            res.render('tables');
        });

        app.post('/tables/create', (req, res) => {
            var data;
            for(var i in req.body)
                data = JSON.parse(i);
            if(/* !data.gamedata || */ !data.hostnick) { // data incomplete
                res.send(JSON.stringify({err: 'Incomplete data'}));
            } else {
                var id = token();
                while(TABLEDATA[id]) id = token();
                TABLEDATA[id] = {};
                TABLEDATA[id].hostname = data.hostnick;
                TABLEDATA[id].hostnick = data.hostnick;
                TABLEDATA[id].hostpass = token(4);
                TABLEDATA[id].hostsocket = data.socket;
                TABLEDATA[id].gamedata = data.gamedata;
                res.send({
                    id: id,
                    pass: TABLEDATA[id].hostpass
                });
            }
            tables.emit('update-list', converttables());
//                console.log(JSON.parse(i).hostnick);
//            console.log('creating table: ' + req.body);
        });
        
        app.get('/tables/:id', (req, res) => {
            var id = req.params.id;

            if(TABLEDATA[id]) {

            } else {
                res.render('error', {msg: 'Szukana strona nie istnieje.'});
            }
        });

        app.post('/tables/:id', (req, res) => {
            var id = req.params.id;

            if(TABLEDATA[id]) { // table exists
                res.render('game', {
                    hostnick: TABLEDATA[id].hostnick,
                    guestnick: TABLEDATA[id].guestnick,
                        
                });
                if(!TABLEDATA[id].guestpass) { // there is no second player yet
                    TABLEDATA[id].guestpass = token();                    
                    TABLEDATA[id].guestname = req.cookies.username;
                    TABLEDATA[id].guestnick = req.cookies.nickname;
                    if(!TABLEDATA[id].hostcolor) TABLEDATA[id].hostcolor = (Math.random() < 0.5);
                    res.render('game', { 
                        hostnick: TABLEDATA[id].hostnick,
                        guestnick: TABLEDATA[id].guestnick,
                        pass: TABLEDATA[id].guestpass
                    });
                } else {
                    res.render('error', {msg: 'Stół jest zajęty.'});
                }
            } else {
                res.render('error', {msg: 'Szukany stół nie istnieje.'});
            }
        });

        app.get('/tables/:id', (req, res) => {
            if(TABLEDATA[req.params.id]) {
                res.render('game');
            } else {
                res.end('error');
            }
            // spectate a table, or play
            // req.params.id - table's ID
            res.end();
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
            socket.on('connect:host', function(data) {
                console.log('connected host');
                if(TABLEDATA[data.id] && TABLEDATA[data.id].hostnick === data.nick && TABLEDATA[data.id].hostpass === data.pass) {
                    TABLEDATA[data.id].hostsocket = socket.id;
                    socket.emit('connect:resp')
                } else {

                }
            })
            socket.on('connect:guest', function(data) {
                TABLEDATA[data].guestsocket = socket.id;
                if(!TABLEDATA[data].hostsocket) {
                    socket.emit('wait');
                } else {
                    io.to(TABLEDATA[data].hostsocket).emit('guest-joined', {
                        guestname: TABLEDATA[data].guestnick
                    })
                }
            });
        });
    }

}