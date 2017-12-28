
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