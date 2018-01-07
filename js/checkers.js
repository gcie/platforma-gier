
class Game {
    constructor(width, height, rows) {
        this.width = width ? width : 8;
        this.height = height ? height : 8;
        this.rows = rows ? rows : 3;

        this.pieceCount = 0;
        this.pieces = [];

        // game main parameters
        this.starts = true; // white
        this.flyingKings = true;
        this.backwardCapture = true;
        this.mandatoryCapture = true;
        this.fullCapture = true;
        this.droppingPieces = false;
        this.promotionOnTheFly = false;

        this.currentTurn = this.starts;

        // Set up pieces
        for(var i = 0; i < this.rows; i++)
        for(var j = 0; j < this.width; j++)
        if (i % 2 != j % 2)
            this.pieces[this.pieceCount++] = {
                color: true, // white
                x: j,
                y: i,
                promoted: false
            }
        for(var i = this.height - this.rows; i < this.height; i++) 
        for(var j = 0; j < this.width; j++) 
        if (i % 2 != j % 2) 
            this.pieces[this.pieceCount++] = {
                color: false, // black
                x: j,
                y: i,
                promoted: false
            }
    }

    classic() {
        this.starts = true; // white
        this.flyingKings = true;
        this.backwardCapture = true;
        this.mandatoryCapture = true;
        this.fullCapture = true;
        this.droppingPieces = false;
        this.promotionOnTheFly = false;
    }

    pool() {
        this.starts = true; // white
        this.flyingKings = true;
        this.backwardCapture = true;
        this.mandatoryCapture = false;
        this.fullCapture = true;
        this.droppingPieces = false;
        this.promotionOnTheFly = false;
    }

    russian() {
        this.starts = true; // white
        this.flyingKings = true;
        this.backwardCapture = true;
        this.mandatoryCapture = true;
        this.fullCapture = true;
        this.droppingPieces = false;
        this.promotionOnTheFly = true;
    }

    english() {
        this.starts = true; // white
        this.flyingKings = false;
        this.backwardCapture = false;
        this.mandatoryCapture = false;
        this.fullCapture = true;
        this.droppingPieces = false;
        this.promotionOnTheFly = false;
    }

    toJSON() {
        return {
            width: this.width,
            height: this.height,
            rows: this.rows,
    
            pieceCount: this.pieceCount,
            pieces: this.pieces,
    
            // game main parameters
            starts: this.starts,
            flyingKings: this.flyingKings,
            backwardCapture: this.backwardCapture,
            mandatoryCapture: this.mandatoryCapture,
            fullCapture: this.fullCapture,
            droppingPieces: this.droppingPieces,
            promotionOnTheFly: this.promotionOnTheFly,
    
            currentTurn: this.currentTurn
        }
    }
}

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

function validateMove(game, move) {
    if(game.currentTurn != move.piece.color) return false; // wrong turn
    if(!game.pieces.includes(move.piece)) return false; // no such piece
    var moves = getMoves(game, move.piece);
    var captures = getCaptures(game, move.piece);
    if(!moves.includes(move) && !captures.includes(move)) return false; // not available
    return true;
}

function executeMove(game, move) {
    move.piece.x = move.toX;
    move.piece.y = move.toY;
    if(move.capture) {
        removePiece(game, move.captured);
    }
    if(promotionZone(game, move.piece)) {
        if(game.promotionOnTheFly || getCaptures(game, move.piece) == []) {
            move.piece.promoted = true;
        }
    }
    if(!move.capture || getCaptures(game, move.piece) == []) {
        game.currentTurn = !game.currentTurn;
    }
}

module.exports = {
    Game,
    getMoves,
    getCaptures,
    validateMove,
    executeMove
}