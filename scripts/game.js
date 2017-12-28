//var game = new Game(8, 8);
function init() {

    var game = new Game(8, 8);
    game.internationalDraugths();
    var pieces = [];
    var count = 0;
    var board = document.getElementById('board');

    for(var i = 0; i < 64; i++) {
        if (game.square[i].content) {
            pieces[count] = document.createElement('piece');
            if(game.square[i].content.color == true) {
                if(game.square[i].content.promoted == true) {
                    pieces[count].className = 'white-king';
                } else {
                    pieces[count].className = 'white-man';                    
                }
            } else {
                if(game.square[i].content.promoted == true) {
                    pieces[count].className = 'black-king';
                } else {
                    pieces[count].className = 'black-man';   
                }
            }
            pieces[count].style.transform = `translate(${game.square[i].content.square.posX * 64}px, ${game.square[i].content.square.posY * 64}px)`;
            console.log(`translate(${game.square[i].content.square.posX * 64}px, ${game.square[i].content.square.posY * 64}px)`);
            console.log(pieces[count]);
            board.appendChild(pieces[count]);
            count ++;
        }
    }
    var pieces = board.getElementsByTagName('piece');
    console.log(pieces);
}

window.onload = init;
//pieces[0].setAttribute('width', '12px');


