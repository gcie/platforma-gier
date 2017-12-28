

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

class Piece {
    constructor(square, moves, captures, promotedMoves, promotedCaptures, color) {
        this.square = square;
        this.moves = moves;
        this.captures = captures;
        this.promotedMoves = promotedMoves;
        this.promotedCaptures = promotedCaptures;
        this.promoted = false;
        this.color = color;
    }

    promote() {
        this.promoted = true;
        this.moves = this.promotedMoves;
        this.captures = this.promotedCaptures;
    }

    promotion() {
        return this.square.posY == 0
    }

    getFirstMoves() {
        availableMoves = [];
        for(var move of moves) {
            if(move[0]) { // long move
                var i = 1;
                var capX, capY;
                while(this.board.getSquare(this.x + i * move[1], this.y + i * move[2]) && // square exists (is not of board)
                    !this.board.getPiece(this.x + i * move[1], this.y + i * move[2])) { // square is not occupied
                    availableMoves.push({
                        fromX: this.x,
                        fromY: this.y,
                        toX  : this.x + move[1] * i,
                        toY  : this.y + move[2] * i,
                        capture: false
                    });
                    i++;
                }
                if(this.board.getPiece(this.x + i * move[1], this.y + i * move[2]) &&  // piece exists
                    this.board.getPiece(this.x + i * move[1], this.y + i * move[2]).color != this.color) { // tile is of opposite color
                    capX = this.x + i*move[1];
                    capY = this.y + i*move[2];
                    i++;       
                    while(this.board.getSquare(this.x + i * move[1], this.y + i * move[2]) &&  // square exists
                        !this.board.getPiece(this.x + i * move[1], this.y + i * move[2])) { // square is not occupied
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
            } else { // short move
                var capX, capY;
                if(this.board.getSquare(this.x + move[1], this.y + move[2]) && // square exists (is not of board)
                    !this.board.getPiece(this.x + move[1], this.y + move[2])) { // square is not occupied
                    availableMoves.push({
                        fromX: this.x,
                        fromY: this.y,
                        toX  : this.x + move[1],
                        toY  : this.y + move[2],
                        capture: false
                    });
                }
                if(this.board.getPiece(this.x + move[1], this.y + move[2]) &&  // piece exists
                    this.board.getPiece(this.x + move[1], this.y + move[2]).specs.color != this.specs.color) { // piece is of opposite color
                    if(this.board.getSquare(this.x + 2 * move[1], this.y + 2 * move[2]) &&  // square exists
                        !this.board.getPiece(this.x + 2 * move[1], this.y + 2 * move[2])) { // square is not occupied
                            availableMoves.push({
                                fromX: this.x,
                                fromY: this.y,
                                toX  : this.x + move[1] * 2,
                                toY  : this.y + move[2] * 2,
                                capture: true,
                                capX : this.x + move[1],
                                capY : this.y + move[2]
                            });
                        i++;
                    }
                }
            }
        }
        return availableMoves;
    }

}

manMoves = function*() {
    yield [false, -1, -1];
    yield [false,  1, -1];
}

var revManMoves = function*() {
    yield [false,  1, 1];
    yield [false, -1, 1];
}

manCaptures = function*() {
    yield [false, -1, -1];
    yield [false, -1,  1];
    yield [false,  1, -1];
    yield [false,  1,  1];    
}

kingMoves = function*() {
    yield [true, -1, -1];
    yield [true, -1,  1];
    yield [true,  1, -1];
    yield [true,  1,  1];    
}

kingCaptures = kingMoves;

class ManPiece extends Piece {
    constructor(square, color) {
        super(square, color ? manMoves : revManMoves, manCaptures, kingMoves, kingCaptures, color);
    }
}