/**
 * funkcje użytkowe
 */

function moves(game, color, promoted) {
    if(promoted) {
        return function*() {
            yield [game.flyingKings, -1, -1];
            yield [game.flyingKings, -1,  1];
            yield [game.flyingKings,  1, -1];
            yield [game.flyingKings,  1,  1];    
        }
    } else if(color) {
        return function*() {
            yield [false,  1, 1];
            yield [false, -1, 1];
        };
    } else {
        return function*() {
            yield [false, -1, -1];
            yield [false,  1, -1];
        }
    }
}

function captures(game, color, promoted) {
    if(promoted) {
        return function*() {
            yield [game.flyingKings, -1, -1];
            yield [game.flyingKings, -1,  1];
            yield [game.flyingKings,  1, -1];
            yield [game.flyingKings,  1,  1]; 
        }
    } else {
        if(game.backwardCapture) {
            return function*() {
                yield [false, -1, -1];
                yield [false, -1,  1];
                yield [false,  1, -1];
                yield [false,  1,  1]; 
            }
        } else if(color) {
            return function*() {
                yield [false,  1, 1];
                yield [false, -1, 1];
            };
        } else {
            return function*() {
                yield [false, -1, -1];
                yield [false,  1, -1];
            }
        }
    }
}

function promotionZone(game, piece) {
    if(piece.color) {
        return piece.y == game.height - 1;
    } else {
        return piece.y == 0;
    }
}

function getPieceId(game, x, y) {
    for(var i = 0; i < game.pieceCount; i++)
    if(game.pieces[i].x == x && game.pieces[i].y == y)
        return i;
    return undefined;
}

function getPiece(game, x, y) {
    var id = getPieceId(game, x, y);
    return id ? game.pieces[id] : undefined;
}

function isOccupied(game, x, y) {
    return getPieceId(game, x, y) === undefined;
}

function removePiece(game, piece) {
    game.pieces.splice(game.pieces.indexOf(piece), 1);
    game.pieceCount--;
}

function getMoves(game, piece) {
    if(!piece) return [];
    availableMoves = [];
    for(var move of moves(game, piece.color, piece.promoted)) {
        if(move[0]) { // long move
            var i = 1;
            var capX, capY;
            while(!isOccupied(game, piece.x + i * move[1], piece.y + i * move[2])) { // square is not occupied
                availableMoves.push({
                    piece: piece,
                    toX  : piece.x + move[1] * i,
                    toY  : piece.y + move[2] * i,
                    capture: false
                });
                i++;
            }
        } else { // short move
            if(!isOccupied(game, piece.x + move[1], piece.y + move[2])) { // square is not occupied
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

function getCaptures(game, piece) {
    if(!piece) return [];
    availableCaptures = [];
    for(var capture of captures(game, piece.color, piece.promoted)) {
        if(capture[0]) { // long capture

            var i = 1;

            while(!isOccupied(game, piece.x + i * move[1], piece.y + i * move[2])) i++; // square is not occupied

            var captured_piece = getPiece(game, piece.x + i * move[1], piece.y + i * move[2]);

            if(captured_piece !== undefined && captured_piece.color != piece.color) { // piece is of opposite color
                i++;
                while(!isOccupied(game, piece.x + i * move[1], piece.y + i * move[2])) { // spot available
                        availableCaptures.push({
                            piece: piece,
                            toX  : piece.x + move[1] * i,
                            toY  : piece.y + move[2] * i,
                            capture: true,
                            captured: captured_piece
                        });
                    i++;
                }
            }
        } else { // short capture
            var captured_piece = getPiece(game, piece.x + move[1], piece.y + move[2]);

            if(captured_piece !== undefined && captured_piece.color != piece.color) { // there is a piece to capture of opposite colour
                if(!isOccupied(game, piece.x + 2 * move[1], piece.y + 2 * move[2])) { // there is a free spot
                    availableCaptures.push({
                        piece: piece,
                        toX  : piece.x + move[1] * 2,
                        toY  : piece.y + move[2] * 2,
                        capture: true,
                        captured: captured_piece
                    });
                }
            }
        }
    }
    return availableCaptures;
}

/**
 * funkcje do renderowania widoku gry
 */
function render(game) {
    board = document.getElementById('board');
    
    // clear board
    var pieces = document.getElementsByClassName('piece');
    for (piece in pieces) {
        board.removeChild(piece);
    }

    var pieces = [];
    for(var piece in game.pieces) {
        pieces.push(document.createElement('piece'));
    
        pieces[pieces.length - 1].className = 
            (piece.color ? 'white-' : 'black-') + 
            (piece.promoted ? 'king' : 'man')
        pieces[pieces.length - 1].style.transform = 
            `translate(${piece.x * 64}px, ${piece.y * 64}px)`;
        set_piece(pieces[pieces.length - 1]);
        board.appendChild(pieces[pieces.length - 1]);
    }
}

document.onload = function() {
    
}
