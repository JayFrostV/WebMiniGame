var rows = 5;
var columns = 5;
var correctPositions = [];
var currTile;
var otherTile;
var turns = 0;

window.onload = function() {
    setBoard();

    document.getElementById("replay-button").addEventListener("click", function() {
        resetGame();
    });
}

function setBoard() {
    document.getElementById("board").innerHTML = ""; 
    document.getElementById("left-pieces").innerHTML = ""; 
    document.getElementById("right-pieces").innerHTML = "";
    turns = 0;
    document.getElementById("turns").innerText = turns;
    document.getElementById("win-overlay").style.visibility = "hidden";

    correctPositions = [];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("img");
            tile.src = "./images/blank.jpg";
            correctPositions.push("./images/" + ((r * columns + c + 1).toString()) + ".jpg"); // Lưu vị trí đúng
            tile.addEventListener("dragstart", dragStart);
            tile.addEventListener("dragover", dragOver);
            tile.addEventListener("dragenter", dragEnter);
            tile.addEventListener("dragleave", dragLeave);
            tile.addEventListener("drop", dragDrop);
            tile.addEventListener("dragend", dragEnd);
            document.getElementById("board").append(tile);
        }
    }

    let pieces = [];
    for (let i = 1; i <= rows * columns; i++) {
        pieces.push(i.toString());
    }
    shuffle(pieces);

    for (let i = 0; i < pieces.length; i++) {
        let tile = document.createElement("img");
        tile.src = "./images/" + pieces[i] + ".jpg";

        tile.addEventListener("dragstart", dragStart);
        tile.addEventListener("dragover", dragOver);
        tile.addEventListener("dragenter", dragEnter);
        tile.addEventListener("dragleave", dragLeave);
        tile.addEventListener("drop", dragDrop);
        tile.addEventListener("dragend", dragEnd);

        if (i % 2 === 0) {
            document.getElementById("left-pieces").append(tile);
        } else {
            document.getElementById("right-pieces").append(tile);
        }
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function dragStart() {
    currTile = this;
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
}

function dragLeave() {}

function dragDrop() {
    otherTile = this;
}

function dragEnd() {
    if (currTile.src.includes("blank")) {
        return;
    }
    let currImg = currTile.src;
    let otherImg = otherTile.src;
    currTile.src = otherImg;
    otherTile.src = currImg;

    turns += 1;
    document.getElementById("turns").innerText = turns;

    checkWin();
}

function checkWin() {
    let boardTiles = document.querySelectorAll("#board img");
    for (let i = 0; i < boardTiles.length; i++) {
        let boardImg = boardTiles[i].src.split("/").pop();
        let correctImg = correctPositions[i].split("/").pop();
        if (boardImg !== correctImg) {
            return;
        }
    }

    document.getElementById("win-overlay").style.visibility = "visible";
}

function resetGame() {
    setBoard();
}
