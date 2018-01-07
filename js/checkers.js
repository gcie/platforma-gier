/**
 * funkcja inicjalizująca obiekt gry, wysyłany z serwera
 * 
 * @param {int} width - Board's width
 * @param {int} height - Board's height
 * @param {int} rows - Number of rows filled with pieces
 */
function internationalDraughts(width, height, rows) {
    var draughts = {
        /**
         * color:
         *      true: white (flip coords),
         *      false: black
         */
        width: 8,
        height: 8,
        rows: 3,

        piece_count: 0,

        pieces: [],
        
        current_turn: true, // white starts

        promotionZone: function(color, x, y) {
            return color ? y == height - 1 : y == 0;
        },
        moves: function(color, prmoted) {
            if(promoted) {
                return function*() {
                    yield [true, -1, -1];
                    yield [true, -1,  1];
                    yield [true,  1, -1];
                    yield [true,  1,  1];    
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
        },
        captures: function(color, promoted) {
            return function*() {
                yield [promoted, -1, -1];
                yield [promoted, -1,  1];
                yield [promoted,  1, -1];
                yield [promoted,  1,  1]; 
            }
        },
    };

    // Set up main properties
    draugths.width = width ? width : 8;
    draugths.height = height ? height : 8;
    draugths.rows = rows ? rows : 3;
    draugths.pieces = [];
    draugths.piece_count = 0;

    // Set up pieces
    for(var i = 0; i < draugths.rows; i++)
    for(var j = 0; j < draugths.width; j++)
    if (i % 2 != j % 2)
        draugths.pieces[draugths.piece_count++] = {
            color: true, // white
            x: j,
            y: i,
            promoted: false
        }
    for(var i = draugths.height - draugths.rows; i < draugths.height; i++) 
    for(var j = 0; j < draugths.width; j++) 
    if (i % 2 != j % 2) 
        draugths.pieces[draugths.piece_count++] = {
            color: false, // black
            x: j,
            y: i,
            promoted: false
        }
    
    return draughts;
}

function getPieceId(game, x, y) {
    for(var i = 0; i < game.piece_count; i++)
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
    game.piece_count--;
}

function getMoves(game, piece) {
    availableMoves = [];
    for(var move of game.moves(piece.color, piece.promoted)) {
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
    availableCaptures = [];
    for(var capture of game.captures(piece.color, piece.promoted)) {
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
                        capXtured: captured_piece
                    });
                }
            }
        }
    }
    return availableCaptures;
}

function validateMove(game, piece, move) {
    if(game.current_turn != piece.color) return false; // wrong turn
    if(!game.pieces.includes(piece)) return false; // no such piece
    var moves = getMoves(game, piece);
    var captures = getCaptures(game, piece);
    if(!moves.includes(move) && !captures.includes(move)) return false; // not available
    return true;
}

// TODO
function executeMove(game, piece, move) {
    piece.x = move.toX;
    piece.y = move.toY;
    if(move.capture) {
        removePiece(game, move.captured);
    }
    // change below to implement promotion on-the-fly
    if(this.square[move.toY * this.width + move.toX].getFirstMoves() == [] &&   // does not have any moves left
        this.square[move.toY * this.width + move.toX].promotion()) {            // is in promotion zone
        this.square[move.toY * this.width + move.toX].promoted = true;          // promote it!
        this.nextTurn();
    } else if(move.capture == false ||                                             // there was no capture
            this.square[move.toY * this.width + move.toX].getFirstMoves() == []) { // there are no more moves
            this.nextTurn();
    }
}