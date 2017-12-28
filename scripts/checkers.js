/**
 * Square class, represents board square
 */
class Square {
    constructor(board, posX, posY, content) {
        this.board = board;
        this.posX = posX;
        this.posY = posY;
        this.content = content;
    }

    getPiece(x, y) {
        if((x == undefined && y == undefined) || (x == this.posX && y == this.posY)) {
            return this.content;
        } else {
            return this.board.getPiece(x, y);            
        }
    }
}

class Game {
    constructor(width, height) {
        this.width = width ? width: 8;
        this.height = height ? height : 8;
        this.square = [];
        this.turn = true;
        this.PROMOTE_ON_THE_FLY = false; // not implemented
        for(var i = 0; i < this.width * this.height; i++) {
            this.square[i] = new Square(this, i % this.width, Math.round(-0.5 + i / this.width));
        }
    }

    internationalDraugths(rows) {
        if(!rows) rows = 3;
        for(var i = 0; i < rows; i++) {
            for(var j = 0; j < this.width; j++) {
                if (i % 2 != j % 2) {
                    this.square[i * this.width + j].content = new ManPiece(this.square[i * this.width + j], false);
                }
            }
        }
        
        for(var i = this.height - rows; i < this.height; i++) {
            for(var j = 0; j < this.width; j++) {
                if (i % 2 != j % 2) {
                    this.square[i * this.width + j].content = new ManPiece(this.square[i * this.width + j], true)
                }
            }
        }
    }

    nextTurn() {
        this.turn = !this.turn;
    }

    getSquare(x, y) {
        return this.square[y * this.width + x];
    }

    getPiece(x, y) {
        if(this.square[y * this.width + x])
            return this.square[y * this.width + x].content;
        else
            return undefined;
    }

    executeMove(move) {
        this.movePiece(move.fromX, move.fromY, move.toX, move.toY);
        if(move.capture) {
            this.square[move.capY * this.width + move.capX] = undefined;
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

    movePiece(fromX, fromY, toX, toY) {
        this.square[toY   * this.width +   toX].content = this.getPiece(fromX, fromY);
        this.square[fromY * this.width + fromX].content = undefined;        
    }

    clone() {
        return Object.assign(new Game, this);
    }
}

