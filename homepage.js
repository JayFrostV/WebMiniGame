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
        