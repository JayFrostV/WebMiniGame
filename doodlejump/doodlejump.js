let board;
let boardWidth = 360;
let boardHeight = 576;
let context;
let gameStarted = false;

let doodlerWidth = 46;
let doodlerHeight = 46;
let doodlerX = boardWidth / 2 - doodlerWidth / 2;
let doodlerY = boardHeight * 7 / 8 - doodlerHeight;
let doodlerRightImg;
let doodlerLeftImg;

let doodler = {
    img: null,
    x: doodlerX,
    y: doodlerY,
    width: doodlerWidth,
    height: doodlerHeight,
};

let velocityX = 0;
let velocityY = 0;
let initialVelocityY = -7;
let gravity = 0.4;

let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

let score = 0;
let maxScore = 0;
let gameOver = false;
let currentPlayer = localStorage.getItem("username") || "Unknown Player";
let bestScore = localStorage.getItem("bestScore") || 0;
let bestPlayer = localStorage.getItem("bestPlayer") || "No one";

window.onload = function () {
    try {
        board = document.getElementById("board");
        board.height = boardHeight;
        board.width = boardWidth;
        context = board.getContext("2d");

        doodlerRightImg = new Image();
        doodlerRightImg.src = "./doodler-right.png";
        doodler.img = doodlerRightImg;
        doodlerRightImg.onload = function () {
            context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
        };

        doodlerLeftImg = new Image();
        doodlerLeftImg.src = "./doodler-left.png";

        platformImg = new Image();
        platformImg.src = "./platform.png";

        velocityY = initialVelocityY;

        requestAnimationFrame(update);
        document.addEventListener("keydown", startGame);
        document.addEventListener("keydown", moveDoodler);

        // Display player information
        document.getElementById("currentPlayer").innerText = currentPlayer;
        document.getElementById("bestScore").innerText = bestScore;
        document.getElementById("bestPlayer").innerText = bestPlayer;
    } catch (error) {
        console.error("Error initializing game:", error);
    }
};

function update() {
    requestAnimationFrame(update);
    if (!gameStarted) {
        context.clearRect(0, 0, board.width, board.height);
        context.fillStyle = "black";
        context.font = "24px sans-serif";
        context.fillText("Press any button to start", boardWidth / 6, boardHeight / 2);
        return;
    }

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    doodler.x += velocityX;
    if (doodler.x > boardWidth) {
        doodler.x = 0;
    } else if (doodler.x + doodler.width < 0) {
        doodler.x = boardWidth;
    }

    velocityY += gravity;
    doodler.y += velocityY;
    if (doodler.y > board.height) {
        gameOver = true;
        checkBestScore();
    }
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];
        if (velocityY < 0 && doodler.y < boardHeight * 3 / 4) {
            platform.y -= initialVelocityY;
        }
        if (detectCollision(doodler, platform) && velocityY >= 0) {
            velocityY = initialVelocityY;
        }
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift();
        newPlatform();
    }

    updateScore();
    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText(score, 5, 20);

    if (gameOver) {
        context.fillText("Game Over: Press 'Space' to Restart", boardWidth / 7, boardHeight * 7 / 8);
    }
}

function startGame(e) {
    if (!gameStarted) {
        gameStarted = true;
        placePlatforms();
    }
}

function moveDoodler(e) {
    if (e.code == "ArrowRight" || e.code == "KeyD") {
        velocityX = 4;
        doodler.img = doodlerRightImg;
    } else if (e.code == "ArrowLeft" || e.code == "KeyA") {
        velocityX = -4;
        doodler.img = doodlerLeftImg;
    } else if (e.code == "Space" && gameOver) {
        resetGame();
    }
}

function placePlatforms() {
    platformArray = [];

    let platform = {
        img: platformImg,
        x: boardWidth / 2,
        y: boardHeight - 50,
        width: platformWidth,
        height: platformHeight,
    };

    platformArray.push(platform);

    for (let i = 0; i < 6; i++) {
        let randomX = Math.floor(Math.random() * (boardWidth * 3 / 4));
        let platform = {
            img: platformImg,
            x: randomX,
            y: boardHeight - 75 * i - 150,
            width: platformWidth,
            height: platformHeight,
        };

        platformArray.push(platform);
    }
}

function newPlatform() {
    let randomX = Math.floor(Math.random() * (boardWidth * 3 / 4));
    let platform = {
        img: platformImg,
        x: randomX,
        y: -platformHeight,
        width: platformWidth,
        height: platformHeight,
    };

    platformArray.push(platform);
}

function detectCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function updateScore() {
    let points = Math.floor(50 * Math.random());
    if (velocityY < 0) {
        maxScore += points;
        if (score < maxScore) {
            score = maxScore;
        }
    } else if (velocityY >= 0) {
        maxScore -= points;
    }
}

function resetGame() {
    doodler = {
        img: doodlerRightImg,
        x: doodlerX,
        y: doodlerY,
        width: doodlerWidth,
        height: doodlerHeight,
    };

    velocityX = 0;
    velocityY = initialVelocityY;
    score = 0;
    maxScore = 0;
    gameOver = false;
    placePlatforms();
}

function checkBestScore() {
    if (score > bestScore) {
        bestScore = score;
        bestPlayer = currentPlayer;
        localStorage.setItem("bestScore", bestScore);
        localStorage.setItem("bestPlayer", bestPlayer);
        document.getElementById("bestScore").innerText = bestScore;
        document.getElementById("bestPlayer").innerText = bestPlayer;
    }
}
