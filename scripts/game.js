//var game = new Game(8, 8);

var game = new Game(8, 8);
var board;
var pieces = [];
var count = 0;

function set_piece(piece) {
    var marks = board.getElementsByClassName('last-move');
    marks[0].
    game.getPiece

}

function init() {

    var game = new Game(8, 8);
    var board;
    var pieces = [];
    var count = 0;
    
    game.internationalDraugths();
    board = document.getElementById('board');

    for(var i = 0; i < 64; i++) {
        if (game.square[i].content) {
            pieces[count] = document.createElement('piece');

            pieces[count].className = 
                (game.square[i].content.color ? 'white-' : 'black-') + 
                (game.square[i].content.promoted ? 'king' : 'man')
            pieces[count].style.transform = `translate(${game.square[i].content.square.posX * 64}px, ${game.square[i].content.square.posY * 64}px)`;
            set_piece(pieces[count]);
            board.appendChild(pieces[count]);
            count ++;
        }
    }
    var pieces = board.getElementsByTagName('piece');
    console.log(pieces);
}

window.onload = init;
//pieces[0].setAttribute('width', '12px');


