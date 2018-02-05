
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
        this.activePiece = undefined;

        this.desc = 'Classic ' + this.width + 'x' + this.height;

        /**
         * this.time = 10;
         * this.increment = 0;
         */

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

        this.desc = 'Classic ' + this.width + 'x' + this.height;
    }

    pool() {
        this.starts = true; // white
        this.flyingKings = true;
        this.backwardCapture = true;
        this.mandatoryCapture = false;
        this.fullCapture = true;
        this.droppingPieces = false;
        this.promotionOnTheFly = false;
        
        this.desc = 'Pool ' + this.width + 'x' + this.height;
    }

    russian() {
        this.starts = true; // white
        this.flyingKings = true;
        this.backwardCapture = true;
        this.mandatoryCapture = true;
        this.fullCapture = true;
        this.droppingPieces = false;
        this.promotionOnTheFly = true;
        
        this.desc = 'Russian ' + this.width + 'x' + this.height;
    }

    english() {
        this.starts = true; // white
        this.flyingKings = false;
        this.backwardCapture = false;
        this.mandatoryCapture = false;
        this.fullCapture = true;
        this.droppingPieces = false;
        this.promotionOnTheFly = false;
        
        this.desc = 'English ' + this.width + 'x' + this.height;
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
    
            currentTurn: this.currentTurn,
            desc: this.desc,

            guestnick: this.guestnick,
            hostnick: this.hostnick
        }
    }
}

function* movesIterator(game, color, promoted) {
    if(promoted) {
        yield [game.flyingKings, -1, -1];
        yield [game.flyingKings, -1,  1];
        yield [game.flyingKings,  1, -1];
        yield [game.flyingKings,  1,  1];    
    } else if(color) {
        yield [false,  1, 1];
        yield [false, -1, 1];
    } else {
        yield [false, -1, -1];
        yield [false,  1, -1];
    }
}

function* capturesIterator(game, color, promoted) {
    if(promoted) {
        yield [game.flyingKings, -1, -1];
        yield [game.flyingKings, -1,  1];
        yield [game.flyingKings,  1, -1];
        yield [game.flyingKings,  1,  1]; 
    } else {
        if(game.backwardCapture) {
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
    return id != undefined ? game.pieces[id] : undefined;
}

function isFree(game, x, y) {
    return x >= 0 && x < game.width && y >= 0 && y < game.height && getPieceId(game, x, y) === undefined;
}

function removePiece(game, piece) {
    game.pieces.splice(game.pieces.indexOf(piece), 1);
    game.pieceCount--;
}

function getMoves(game, piece) {
    if(!piece) return [];
    availableMoves = [];
    for(var move of movesIterator(game, piece.color, piece.promoted)) {
        if(move[0]) { // long move
            var i = 1;
            var capX, capY;
            while(isFree(game, piece.x + i * move[1], piece.y + i * move[2])) { // square is not occupied
                availableMoves.push({
                    piece: piece,
                    toX  : piece.x + move[1] * i,
                    toY  : piece.y + move[2] * i,
                    capture: false
                });
                i++;
            }
        } else { // short move
            if(isFree(game, piece.x + move[1], piece.y + move[2])) { // square is not occupied
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
    for(var move of capturesIterator(game, piece.color, piece.promoted)) {
        if(move[0]) { // long capture

            var i = 1;

            while(isFree(game, piece.x + i * move[1], piece.y + i * move[2])) i++; // square is not occupied

            var captured_piece = getPiece(game, piece.x + i * move[1], piece.y + i * move[2]);

            if(captured_piece !== undefined && captured_piece.color != piece.color) { // piece is of opposite color
                i++;
                while(isFree(game, piece.x + i * move[1], piece.y + i * move[2])) { // spot available
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
                if(isFree(game, piece.x + 2 * move[1], piece.y + 2 * move[2])) { // there is a free spot
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
    if(!getPiece(game, move.piece.x, move.piece.y)) return "Moving piece does not exist";
    piece = getPiece(game, move.piece.x, move.piece.y);
    if(game.currentTurn != move.piece.color) return "Wrong turn"; // wrong turn
    if(game.activePiece) {
        if(game.activePiece != piece) return "You must continue capture";
        if(!move.capture) return "You must capture";
    }
    var moves = getMoves(game, piece);
    var captures = getCaptures(game, piece);
    if(!contains(moves, move) && !contains(captures, move)) return "Such move is not available"; // not available
    return "";
}

function contains(moves, move) {
    for(var m of moves) {
        if(JSON.stringify(m) == JSON.stringify(move)) return true;
    }
    return false;
}

function executeMove(game, move) {
    var piece = getPiece(game, move.piece.x, move.piece.y);
    piece.x = move.toX;
    piece.y = move.toY;
    if(move.capture) removePiece(game, getPiece(game, move.captured.x, move.captured.y));
    if(promotionZone(game, piece)) {
        if(move.capture) {
            if(game.promotionOnTheFly || !game.fullCapture || (getCaptures(game, piece).length == 0)) {
                piece.promoted = true;
            }
        } else {
            piece.promoted = true;
        }
    }
    if(move.capture && game.fullCapture && (getCaptures(game, piece).length > 0)) {
            game.activePiece = piece;
    } else {
        game.currentTurn = !game.currentTurn;        
        game.activePiece = undefined;
    }
}

function getState(game) {
    var white = true;
    var black = true;
    for(var i = 0; i < game.pieces.length; i++) {
        if(game.pieces[i].color) black = false;
        if(!game.pieces[i].color) white = false;        
    }
    return {finished: white || black, won: white};
}

module.exports = {
    Game,
    getMoves,
    getCaptures,
    validateMove,
    executeMove,
    getState
}