
var tables_data = {
    table1: {
        hostname: 'Rambo', // nazwa użytkownika hosta
        gametype: 'Classic 8x8', // rodzaj gry
        id: 'gd713edg8diyqwd87ydeqw' // unikalne id stołu
    },
    table2: {
        hostname: 'xxX_69Anthony69_Xxx',
        gametype: 'Classic 10x10',
        id: 'fh38cn08equ0hdq308uewcx'
    }
};

module.exports = {
    init : function(io, app) {
    
        app.get('/tables/:id/join', (req, res) => {
            // join a table 
            // req.params.id - table's ID
            res.end();
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


        var tables = io.of('/table');

            
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