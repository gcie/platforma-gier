var socket;

function spectate(tableId) {
    window.location.href = '/tables/' + tableId;
}

function buildTable(data) {
    var res = "<tr><th>Hostname</th><th>Guestname</th><th>Game type</th><th></th></tr>";
    for(var table in data) {
        res += "<tr><td>" + data[table].hostname + "</td><td>";
        if(data[table].guestname) {
            res += data[table].guestname + "</td><td>" + data[table].gametype + "</td><td>" + "<button onclick='spectate(" + '"' + table + '"' +  ")'>Oglądaj</button></td>";
        } else {
            res += "-</td><td>" + data[table].gametype + "</td><td>" + "<button onclick='joinTable(" + '"' + table + '"' + ")'>Dołącz</button></td></tr>";
        }
    }
    document.getElementById('tables').innerHTML = res;
}

function joinTable(tableId) {
    var req = new XMLHttpRequest();
    req.open('post', '/tables/join');
    
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.send(`id=${tableId}`);

    req.onreadystatechange = function() {
        if(req.readyState == XMLHttpRequest.DONE) {
            var data = JSON.parse(req.response);
            if(data.err || !data.id || !data.pass) {
                console.log(data.err);
            } else {
                window.localStorage.setItem('currentGameId', data.id);
                window.localStorage.setItem('currentGamePass', data.pass);
                window.location.href = '/tables/' + data.id + "?p=" + data.pass;
            }
        }
    };
}


function createTable(gametype) {
    var req = new XMLHttpRequest();

    req.open('post', '/tables/create');
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.send(`gametype=${gametype}`);

    req.onreadystatechange = function() {
        if(req.readyState == XMLHttpRequest.DONE) {
            var data = JSON.parse(req.response);
            if(data.err || !data.id || !data.pass) {
                console.log(data.err);
            } else {
                window.localStorage.setItem('currentGameId', data.id);
                window.localStorage.setItem('currentGamePass', data.pass);
                window.location.href = '/tables/' + data.id + "?p=" + data.pass;
            }
        }
    };
}

function socketRegister() {
    socket = io('/tables');
    socket.on('update-list', function(data) {
        buildTable(data);
    });
}

window.onload = function() {
    socketRegister();
    document.getElementById('bt-create').addEventListener('click', function() {
        createTable();
    });
}
