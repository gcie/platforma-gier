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
        hostpass: 'host#gf748238d89a9f7',
        hostsocket: 'fr23r32vgjfxr23ar',
        guestname: undefined,
        guestnick: undefined,
        guestpass: undefined,
        guestsocket: undefined,
        gametype: 'Classic 8x8' // rodzaj gry
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
        gametype: 'Classic 10x10'
    }
};

module.exports = {
    init : function(io, app) {
        app.post('/tables/create', (req, res) => {

        });
        
        app.post('/tables/join/:id', (req, res) => {
            var tableId = req.params.id;
            if(tablesData[tableId]) { // table exists
                if(tablesData[tableId].guestpass) { // there is already a guest
                    res.end('error');
                } else {
                    tablesData[tableId].guestpass = token();                    
                    tablesData[tableId].guestname = req.cookies.username;
                    tablesData[tableId].guestnick = req.cookies.nickname;
                    res.redirect(url.format({
                        pathname: '/tables/' + tableId,
                        query: { p: 'guest#' + tablesData[tableId].guestpass }
                    }));
                    
                }
            } else {
                res.end('error');
            }
        });

        app.get('/tables/:id', (req, res) => {
            if(req.query.p)
            {
                res.render('game')
            }
            // spectate a table, or play
            // req.params.id - table's ID
            res.end();
        });

        app.get('/tables', (req, res) => {
            res.render('tables', {tablesData});
        });

        var tables = io.of('/tables');

            
        /**
         *  When user connects to the 'tables' socket through:
         *      var socket = io('/table');
         *  he calls this function below with his socket
         */
        tables.on('connection', function(socket) { // TODO
    
                socket.on('disconnect', function() {
                    /**
                     * destroy tables etc.
                     */
                });
            })
    }

}