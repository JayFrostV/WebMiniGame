var errors = 0;
var cardList = [
    "darkness", "double", "fairy", "fighting", "fire", "grass", 
    "lightning", "metal", "psychic", "water"
];

var cardSet;
var board = [];
var rows = 4;
var columns = 5;

var card1Selected = null;
var card2Selected = null;

var username = localStorage.getItem("username"); // Lấy tên người dùng hiện tại

window.onload = function() {
    loadBestPlayer();
    shuffleCards();
    startGame();
}

function loadBestPlayer() {
    let users = JSON.parse(localStorage.getItem("users")) || {};
    let leastErrors = users[username]?.leastErrors ?? "N/A";
    let bestPlayer = null;
    let lowestErrors = null;

    // Tìm người chơi có số lỗi ít nhất
    for (let user in users) {
        if (users[user].leastErrors !== undefined) {
            if (lowestErrors === null || users[user].leastErrors < lowestErrors) {
                lowestErrors = users[user].leastErrors;
                bestPlayer = user;
            }
        }
    }

    document.getElementById("leastErrors").innerText = lowestErrors !== null ? lowestErrors : "N/A";
    document.getElementById("bestPlayer").innerText = bestPlayer !== null ? bestPlayer : "N/A";
}

function shuffleCards() {
    cardSet = cardList.concat(cardList);
    for (let i = 0; i < cardSet.length; i++) {
        let j = Math.floor(Math.random() * cardSet.length); 
        let temp = cardSet[i];
        cardSet[i] = cardSet[j];
        cardSet[j] = temp;
    }
}

function startGame() {
    document.getElementById("errors").innerText = 0;
    errors = 0;
    board = [];
    card1Selected = null;
    card2Selected = null;

    let boardDiv = document.getElementById("board");
    boardDiv.innerHTML = ""; 

    // Sắp xếp lại thẻ
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let cardImg = cardSet.pop();
            row.push(cardImg);

            let card = document.createElement("img");
            card.id = r.toString() + "-" + c.toString();
            card.src = cardImg + ".jpg";
            card.classList.add("card");
            card.addEventListener("click", selectCard);
            boardDiv.append(card);
        }
        board.push(row);
    }

    document.getElementById("restartButton").style.display = "none"; 
    setTimeout(hideCards, 1000); 
}

function hideCards() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let card = document.getElementById(r.toString() + "-" + c.toString());
            card.src = "back.jpg";
        }
    }
}

function selectCard() {
    if (this.src.includes("back")) {
        if (!card1Selected) {
            card1Selected = this;
            let coords = card1Selected.id.split("-");
            let r = parseInt(coords[0]);
            let c = parseInt(coords[1]);
            card1Selected.src = board[r][c] + ".jpg";
        } else if (!card2Selected && this != card1Selected) {
            card2Selected = this;
            let coords = card2Selected.id.split("-");
            let r = parseInt(coords[0]);
            let c = parseInt(coords[1]);
            card2Selected.src = board[r][c] + ".jpg";
            setTimeout(update, 1000);
        }
    }
}

function update() {
    if (card1Selected.src != card2Selected.src) {
        card1Selected.src = "back.jpg";
        card2Selected.src = "back.jpg";
        errors += 1;
        document.getElementById("errors").innerText = errors;
    }

    card1Selected = null;
    card2Selected = null;

    if (isGameComplete()) {
        saveLeastErrors(); 
        alert("Game Completed!");
        document.getElementById("restartButton").style.display = "block"; 
    }
}

function isGameComplete() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (document.getElementById(r.toString() + "-" + c.toString()).src.includes("back")) {
                return false;
            }
        }
    }
    return true;
}

function saveLeastErrors() {
    let users = JSON.parse(localStorage.getItem("users")) || {};
    let currentLeastErrors = users[username]?.leastErrors;

    // Nếu chưa có số lỗi ít nhất hoặc số lỗi hiện tại nhỏ hơn, cập nhật
    if (currentLeastErrors === undefined || errors < currentLeastErrors) {
        users[username] = { ...users[username], leastErrors: errors };
        localStorage.setItem("users", JSON.stringify(users));
        loadBestPlayer(); 
    }
}

function restartGame() {
    errors = 0;
    shuffleCards();
    startGame();
}
