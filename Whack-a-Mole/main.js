const holes = document.querySelectorAll('.hole');
const scoreBoard = document.querySelector('.score');
const moles = document.querySelectorAll('.mole');
const button = document.querySelector('#start');
let lastHole;
let timeUp = false;
let score = 0;

// Retrieve username from localStorage
const username = localStorage.getItem("username");

window.onload = function() {
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
};

function randomTime(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function randomHole(holes) {
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];

    if (hole === lastHole) {
        return randomHole(holes);
    }

    lastHole = hole;
    return hole;
}

function peep() {
    const time = randomTime(200, 1000);
    const hole = randomHole(holes);
    hole.classList.add('up');
    setTimeout(() => {
        hole.classList.remove('up');
        if (!timeUp) peep();
    }, time);
}

function startGame() {
    scoreBoard.textContent = 0;
    timeUp = false;
    score = 0;
    button.style.visibility = 'hidden';
    peep();
    setTimeout(() => {
        timeUp = true;
        saveScore(); // Save the score when the game ends
        button.innerHTML = 'Try again?';
        button.style.visibility = 'visible';
    }, 10000);
}

function bonk(e) {
    if (!e.isTrusted) return; // Prevent cheating
    score++;
    this.classList.remove('up');
    scoreBoard.textContent = score;
}

function saveScore() {
    let users = JSON.parse(localStorage.getItem("users")) || {};
    let highestScore = users[username] ? users[username].highestScore : 0;

    if (score > highestScore) {
        users[username] = { highestScore: score };
        localStorage.setItem("users", JSON.stringify(users));
        document.getElementById("highestScore").innerText = "Highest Score: " + score;
        document.getElementById("highestScoreUser").innerText = "Top Player: " + username;
    }
}

moles.forEach(mole => mole.addEventListener('click', bonk));
