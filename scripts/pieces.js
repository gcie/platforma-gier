/**
 * funkcje użytkowe
 */
function getPieceId(game, x, y) {
    for(var i = 0; i < game.piece_count; i++) {
        if(game.pieces[i].x == x && game.pieces[i].y == y) {
            return i;
        }
    }
    return undefined;
}

function getPiece(game, x, y) {
    return game.pieces[getPieceId(game, x, y)]
}

function getMoves(game, piece) {
    availableMoves = [];
    for(var move of game.moves(piece.color, piece.promoted)) {
        if(move[0]) { // long move
            var i = 1;
            var capX, capY;
            while(getPieceId(game, piece.x + i * move[1], piece.y + i * move[2]) === undefined) { // square is not occupied
                availableMoves.push({
                    fromX: piece.x,
                    fromY: piece.y,
                    toX  : piece.x + move[1] * i,
                    toY  : piece.y + move[2] * i,
                    capture: false
                });
                i++;
            }

        } else { // short move
            if(getPiece(game, piece.x + move[1], piece.y + move[2])) { // square is not occupied
                availableMoves.push({
                    fromX: piece.x,
                    fromY: piece.y,
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
    availablecaptures = [];
    for(var capture of game.captures(piece.color, piece.promoted)) {
        if(capture[0]) { // long capture
            var i = 1;
            var capX, capY;
            while(getPieceId(game, piece.x + i * move[1], piece.y + i * move[2]) === undefined) // square is not occupied
                i++;

            var captured_piece = getPiece(game, piece.x + i * move[1], piece.y + i * move[2]);
            if(captured_piece !== undefined && captured_piece.color != piece.color) { // tile is of opposite color
                capX = piece.x + i*move[1];
                capY = piece.y + i*move[2];
                i++;
                while(getPiece(this.x + i * move[1], this.y + i * move[2]) === undefined) { // spot available
                        availableMoves.push({
                            fromX: this.x,
                            fromY: this.y,
                            toX  : this.x + move[1] * i,
                            toY  : this.y + move[2] * i,
                            capture: true,
                            capX : capX,
                            capY : capY
                        });
                    i++;
                }
            }
        } else { // short capture
            var capX, capY;
            var captured_piece = getPiece(game, piece.x  + move[1], piece.y + move[2]);
            if(captured_piece !== undefined && captured_piece.color != piece.color) { // there is a piece to capture of opposite colour
                if(getPiece(game, piece.x + 2 * move[1], piece.y + 2 * move[2]) !== undefined) { // there is a free spot
                    availableMoves.push({
                        fromX: piece.x,
                        fromY: piece.y,
                        toX  : piece.x + move[1] * 2,
                        toY  : piece.y + move[2] * 2,
                        capture: true,
                        capX : piece.x + move[1],
                        capY : piece.y + move[2]
                    });
                }
            }
        }
    }
    return availableMoves;
}

/**
 * funkcje do renderowania widoku gry
 */
function render(game) {
    board = document.getElementById('board');
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
}