window.onload = function() {
    const username = localStorage.getItem("username");
    if (!username) {
        alert("Please log in first!");
        window.location.href = "login.html";
        return;
    }

    document.getElementById("usernameDisplay").innerText = username;

    document.getElementById("logoutButton").onclick = function() {
        localStorage.removeItem("username");
        window.location.href = "login.html";
    }
}
document.getElementById("searchInput").addEventListener("input", function() {
    let searchQuery = this.value.toLowerCase();
    let games = document.querySelectorAll(".game");

    games.forEach(function(game) {
        let gameName = game.getAttribute("data-name").toLowerCase();
        if (gameName.includes(searchQuery)) {
            game.style.display = "block";  // Hiển thị trò chơi khớp với tìm kiếm
        } else {
            game.style.display = "none";   // Ẩn trò chơi không khớp với tìm kiếm
        }
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const category = this.innerText.trim();

            const games = document.querySelectorAll('.game');

            games.forEach(game => {
                const gameCategory = game.getAttribute('data-category');
                
                if (category === 'Home' || gameCategory === category) {
                    game.style.display = 'block';
                } else {
                    game.style.display = 'none';
                }
            });
        });
    });
});
document.getElementById("searchInput").addEventListener("input", function() {
    let searchQuery = this.value.toLowerCase();
    let games = document.querySelectorAll(".game");
    let noGamesFound = true; // Flag to track if any games are found

    games.forEach(function(game) {
        let gameName = game.getAttribute("data-name").toLowerCase();
        if (gameName.includes(searchQuery)) {
            game.style.display = "block";  // Show matching games
            noGamesFound = false;          // Game found
        } else {
            game.style.display = "none";   // Hide non-matching games
        }
    });

    const gameListContainer = document.getElementById("gameList");
    let noResultsMessage = document.getElementById("noResults");

    if (noGamesFound) {
        if (!noResultsMessage) {
            noResultsMessage = document.createElement("p");
            noResultsMessage.id = "noResults";
            noResultsMessage.textContent = "No games found";
            noResultsMessage.style.color = "red";
            noResultsMessage.style.textAlign = "center";
            gameListContainer.appendChild(noResultsMessage);
        }
    } else if (noResultsMessage) {
        gameListContainer.removeChild(noResultsMessage); 
    }
});
