// import * as http from "http" // zaremować przed uruchomieniem

/**
 * 
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse}  res 
 * @param {*} next 
 */

var token = require("./token.js");
const url = require('url');

var tablesData = {
    table1_id: {
        hostname: 'sdfRambo', // nazwa użytkownika hosta
        hostnick: 'Rambo',
        hostpass: 'gf748238d89a9f7',
        guestname: undefined,
        guestnick: undefined,
        guestpass: undefined,
        gametype: 'Classic 8x8' // rodzaj gry
    },
    table2_id: {
        hostname: 'xxX_69Anthony69_Xxx',
        hostnick: 'Anthony',
        hostpass: 'r3y89quda9dfuaf',
        guestname: undefined,
        guestnick: undefined,
        guestpass = undefined,
        gametype: 'Classic 10x10'
    }
};

module.exports = {
    init : function(io, app) {
        
        app.post('/tables/join/:id', (req, res) => {
            var tableId = req.params.id;
            if(tablesData[tableId]) {
                if(tablesData[tableId].guestname) {
                    res.end('error');
                } else {
                    tablesData[tableId].guestname = req.cookies.username; 
                    tablesData[tableId].guestnick = req.cookies.nickname;
                    tablesData[tableId].guestpass = token();
                    res.redirect(url.format({
                        pathname: '/tables/' + tableId,
                        query: { p: tablesData[tableId].guestpass }
                    }));
                    io.of('/' + tableId);
                }
            } else {
                res.end('error');
            }
        });

        app.get('/tables/:id', (req, res) => {
            // spectate a table 
            // req.params.id - table's ID
            res.end();
        });

        app.get('/tables', (req, res) => {
            res.render('tables', {tables_data});
        });

        app.post('/tables', (req, res) => {
            // create a table
            res.write('creating table: ' + req.body.game_type);
            res.end();
        })


        var tables = io.of('/tables');

            
        /**
         *  When user connects to the 'tables' socket through:
         *      var socket = io('/table');
         *  he calls this function below with his socket
         */
        tables.on('connection', function(socket) { // TODO
        
                socket.on('create-table', function(data) {
                    /**
                     * assign new table.
                     */
                    var tableId = token();
                    tablesData[tableId] = {
                        hostname = data.username,
                        hostnick = data.nickname,
                        hostsocket = socket.id,
                        guestname = undefined,
                        guestnick = undefined,
                        guestsocket = undefined,
                        gametype = data.gametype
                    }
                    socket.emit('table-id', tableId); // sending table id to it's creator
                });
        
                socket.on('join-table', function(data) {
                    /**
                     * join chosen table.
                     */
                    if (tablesData[data.tableId].guestsocket) {
                        socket.emit('error', 'occupied');
                    } else {
                        tablesData[data.tableId].guestsocket = socket;
                        tablesData[data.tableId].guestname = data.username;
                        tablesData[data.tableId].guestnick = data.nickname
                    }
                    socket.join(data.table_id);
                });
        
                socket.on('disconnect', function() {
                    /**
                     * destroy tables etc.
                     */
                });
            })
    }

}