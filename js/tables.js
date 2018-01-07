// import * as http from "http" // zaremować przed uruchomieniem

/**
 * 
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse}  res 
 * @param {*} next 
 */

var token = require("./token.js");

var tablesData = {
    table1_id: {
        hostname: 'sdfRambo', // nazwa użytkownika hosta
        hostnick: 'Rambo',
        guestname: undefined,
        guestnick: undefined,
        gametype: 'Classic 8x8', // rodzaj gry
        token: 'ncbw12h3oic'
    },
    table2_id: {
        hostname: 'xxX_69Anthony69_Xxx',
        hostnick: 'Anthony',
        guestname: undefined,
        guestnick: undefined,
        gametype: 'Classic 10x10',
        token: 'fewah732de'
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
        
                socket.on('create-table', function(id, data) { // TODO
                    /**
                     * assign new table.
                     * id - uniqe identifier for each user, so when an annymous
                     *  user connects, we will use this as his identifier
                     * data - data of created table, and identification info
                     *  about the user: anonymous / registered
                     */
                    var table_id; // TODO
                    socket.join(table_id); // joining created table
                    socket.emit('table-id', table_id); // sending table id to it's creator
                });
        
                socket.on('join-table', function(id, data) {
                    /**
                     * join chosen table.
                     * id - as above
                     * data - table data and userdata
                     * 
                     * delete the table from database to prevent anyone from connecting to it
                     */
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