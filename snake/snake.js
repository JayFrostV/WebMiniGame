var blockSize = 25;
var rows = 20;
var columns = 20;

var board;
var context;
// Snake head
var snakeX = blockSize * 5;
var snakeY = blockSize * 5;
var velocityX = 0;
var velocityY = 0;

var snakeBody = [];
// Food
var foodX = blockSize * 10;
var foodY = blockSize * 10;
var gameOver = false;
// Score
var score = 0;
// Username from login
var username = localStorage.getItem("username"); // Retrieve username from local storage

window.onload = function () {
    if (!username) {
        alert("Please log in first!");
        window.location.href = "login.html"; // Redirect to login page if not logged in
        return;
    }

    document.getElementById("user").innerText = "Logged in as: " + username;

    // Initialize the highest score from localStorage
    let users = JSON.parse(localStorage.getItem("users")) || {};
    let highestScore = 0;
    let highestScoreUser = "None";

    // Find the player with the highest score
    for (let user in users) {
        if (users[user].highestScore > highestScore) {
            highestScore = users[user].highestScore;
            highestScoreUser = user;
        }
    }

    document.getElementById("highestScore").innerText = "Highest Score: " + highestScore;
    document.getElementById("highestScoreUser").innerText = "Top Player: " + highestScoreUser;

    board = document.getElementById("board");
    board.height = rows * blockSize;
    board.width = columns * blockSize;
    context = board.getContext("2d"); // used for drawing
    placeFood();
    document.addEventListener("keyup", changeDirection);
    setInterval(update, 1000 / 10);
}

function update() {
    if (gameOver) {
        saveScore(); // Save the score when the game is over
        document.getElementById("restartButton").style.display = "block";
        return;
    }

    context.fillStyle = "black";
    context.fillRect(0, 0, board.width, board.height);
    context.fillStyle = "red";
    context.fillRect(foodX, foodY, blockSize, blockSize);

    if (snakeX == foodX && snakeY == foodY) {
        snakeBody.push([foodX, foodY]);
        placeFood();
        score += 1;  // Increase score
        document.getElementById("score").innerText = "Score: " + score; // Update score display
    }

    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }

    if (snakeBody.length) {
        snakeBody[0] = [snakeX, snakeY];
    }

    context.fillStyle = "lime";
    snakeX += velocityX * blockSize;
    snakeY += velocityY * blockSize;
    context.fillRect(snakeX, snakeY, blockSize, blockSize);

    for (let i = 0; i < snakeBody.length; i++) {
        context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);
    }

    // Game over condition
    if (snakeX < 0 || snakeX >= columns * blockSize || snakeY < 0 || snakeY >= rows * blockSize) {
        gameOver = true;
        saveScore();
    }

    for (let i = 0; i < snakeBody.length; i++) {
        if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) {
            gameOver = true;
            saveScore();
        }
    }
}

function changeDirection(e) {
    if (e.code == "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    } else if (e.code == "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    } else if (e.code == "ArrowLeft" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
    } else if (e.code == "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
}

function placeFood() {
    foodX = Math.floor(Math.random() * columns) * blockSize;
    foodY = Math.floor(Math.random() * rows) * blockSize;
}

function saveScore() {
    let users = JSON.parse(localStorage.getItem("users")) || {};
    let highestScore = users[username].highestScore || 0;

    if (score > highestScore) {
        users[username].highestScore = score;
        localStorage.setItem("users", JSON.stringify(users));
        document.getElementById("highestScore").innerText = "Highest Score: " + score;
        document.getElementById("highestScoreUser").innerText = "Top Player: " + username;
    }
}
