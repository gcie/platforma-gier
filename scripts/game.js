/**
 * funkcje użytkowe
 */

function* movesIterator(color, promoted) {
    if(promoted) {
        yield [GAME.flyingKings, -1, -1];
        yield [GAME.flyingKings, -1,  1];
        yield [GAME.flyingKings,  1, -1];
        yield [GAME.flyingKings,  1,  1];    
    } else if(color) {
        yield [false,  1, 1];
        yield [false, -1, 1];
    } else {
        yield [false, -1, -1];
        yield [false,  1, -1];
    }
}

function* capturesIterator(color, promoted) {
    if(promoted) {
        yield [GAME.flyingKings, -1, -1];
        yield [GAME.flyingKings, -1,  1];
        yield [GAME.flyingKings,  1, -1];
        yield [GAME.flyingKings,  1,  1]; 
    } else {
        if(GAME.backwardCapture) {
            yield [false, -1, -1];
            yield [false, -1,  1];
            yield [false,  1, -1];
            yield [false,  1,  1]; 
        } else if(color) {
            yield [false,  1, 1];
            yield [false, -1, 1];
        } else {
            yield [false, -1, -1];
            yield [false,  1, -1];
        }
    }
}

function promotionZone(piece) {
    if(piece.color) {
        return piece.y == GAME.height - 1;
    } else {
        return piece.y == 0;
    }
}

function getPieceId(x, y) {
    for(var i = 0; i < GAME.pieceCount; i++)
    if(GAME.pieces[i].x == x && GAME.pieces[i].y == y)
        return i;
    return undefined;
}

function getPiece(x, y) {
    var id = getPieceId(x, y);
    return id != undefined ? GAME.pieces[id] : undefined;
}

function isFree(x, y) {
    return x >= 0 && x < GAME.width && y >= 0 && y < GAME.height && getPieceId(x, y) === undefined;
}

function removePiece(piece) {
    GAME.pieces.splice(GAME.pieces.indexOf(piece), 1);
    GAME.pieceCount--;
}

function getMoves(piece) {
    if(!piece) return [];
    availableMoves = [];
    for(var move of movesIterator(piece.color, piece.promoted)) {
        if(move[0]) { // long move
            var i = 1;
            var capX, capY;
            while(isFree(piece.x + i * move[1], piece.y + i * move[2])) { // square is not occupied
                availableMoves.push({
                    piece: piece,
                    toX  : piece.x + move[1] * i,
                    toY  : piece.y + move[2] * i,
                    capture: false
                });
                i++;
            }
        } else { // short move
            if(isFree(piece.x + move[1], piece.y + move[2])) { // square is not occupied
                availableMoves.push({
                    piece: piece,
                    toX  : piece.x + move[1],
                    toY  : piece.y + move[2],
                    capture: false
                });
            }
        }
    }
    return availableMoves;
}

function getCaptures(piece) {
    if(!piece) return [];
    availableCaptures = [];
    for(var capture of capturesIterator(piece.color, piece.promoted)) {
        if(capture[0]) { // long capture

            var i = 1;

            while(isFree(piece.x + i * capture[1], piece.y + i * capture[2])) i++; // square is not occupied

            var captured_piece = getPiece(piece.x + i * capture[1], piece.y + i * capture[2]);

            if(captured_piece !== undefined && captured_piece.color != piece.color) { // piece is of opposite color
                i++;
                while(isFree(piece.x + i * capture[1], piece.y + i * capture[2])) { // spot available
                        availableCaptures.push({
                            piece: piece,
                            toX  : piece.x + capture[1] * i,
                            toY  : piece.y + capture[2] * i,
                            capture: true,
                            captured: captured_piece
                        });
                    i++;
                }
            }
        } else { // short capture
            var captured_piece = getPiece(piece.x + capture[1], piece.y + capture[2]);

            if(captured_piece !== undefined && captured_piece.color != piece.color) { // there is a piece to capture of opposite colour
                if(isFree(piece.x + 2 * capture[1], piece.y + 2 * capture[2])) { // there is a free spot
                    availableCaptures.push({
                        piece: piece,
                        toX  : piece.x + capture[1] * 2,
                        toY  : piece.y + capture[2] * 2,
                        capture: true,
                        captured: captured_piece
                    });
                }
            }
        }
    }
    return availableCaptures;
}

var GAME;   
var BOARD;
var guestdata, hostdata;

/**
 * funkcje do renderowania widoku gry
 */
function clearPieces() {
    // clear board
    var pieces = document.getElementsByTagName('piece');
    for (var i = pieces.length - 1; i >= 0; i--) {
        pieces[i].parentNode.removeChild(pieces[i]);
    }
}

function clearHighlights() {
    var highlights = document.getElementsByClassName('highlight');
    for (var i = highlights.length - 1; i >= 0; i--) {
        highlights[i].parentNode.removeChild(highlights[i]);
    }
}

function render() {
    clearPieces();

    var pieces = [];
    for(var piece of GAME.pieces) {
        pieces.push(document.createElement('piece'));
        
        pieces[pieces.length - 1].className = (piece.color ? 'white-' : 'black-') + (piece.promoted ? 'king' : 'man')
        pieces[pieces.length - 1].style.transform = `translate(${mycolor ? (7 - piece.x) * 64 : piece.x * 64}px, ${mycolor ? (7 - piece.y) * 64 : piece.y * 64}px)`;
        pieces[pieces.length - 1].piece = piece;
        pieces[pieces.length - 1].addEventListener('click', function() {
            clearHighlights();
            var moves = getMoves(this.piece);
            var captures = getCaptures(this.piece);
            for(var m of moves) {
                createHighlight(m);
            }
            for(var c of captures) {
                createHighlight(c);
            }
        });
        BOARD.appendChild(pieces[pieces.length - 1]);
    }
}

function sendMove(move) {
    if(move.piece.color != mycolor) {
        console.log("Wrong color");
    } else
    if(move.piece.color != GAME.currentTurn) {
        console.log("Wrong turn");
    } else 
    if(GAME.activePiece != undefined && (move.piece.x != GAME.activePiece.x || move.piece.y != GAME.activePiece.y || move.capture == false)) {
        console.log("You must continue capturing");
    } else {
        socket.emit('move', {move: move, id: id, pass: pass});
    }
}

function createHighlight(move) {
    var h = document.createElement('piece');
    h.className = 'highlight';
    h.style.transform = `translate(${mycolor ? (7 - move.toX) * 64 : move.toX * 64}px, ${mycolor ? (7 - move.toY) * 64 : move.toY * 64}px)`;
    h.move = move;
    h.addEventListener('click', function() { sendMove(this.move); });
    BOARD.appendChild(h);
}

var socket = io('/games');

socket.on('connect response', function(data) {
    console.log(data.success);
});

socket.on('gamestate', function(data) {
    GAME = data;
    render();
});

socket.on('game-end', function(data) {
    setTimeout(() => {
        window.alert(data.msg);
    }, 1000);
});

socket.on('move-error', function(data) {
    window.alert(data);
})

window.onload = function() {
    BOARD = document.getElementById('board');
    document.getElementById('mynick').innerText = mynick;
    document.getElementById('opponentnick').innerText = opponentnick;

    document.getElementById('bt-leave').onclick = function() {
        socket.emit('disconnect ' + seat, {id: id, name: mynick, pass: pass});
        window.location.href = "/";
    }
    socket.emit('connect ' + seat, {id: id, name: mynick, pass: pass});
}

window.onbeforeunload = function(e) {
    e.returnValue = "Hello!";
}

window.onunload = function() {
    socket.emit('disconnect ' + seat, {id: id, name:mynick, pass: pass});
}