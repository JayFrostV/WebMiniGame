// JavaScript for both login and register pages
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("registerForm") || document.getElementById("loginForm");
    
    if (form) {
        form.onsubmit = function(e) {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            
            let users = JSON.parse(localStorage.getItem("users")) || {};
            
            if (form.id === "registerForm") {
                // Registration logic
                if (users[username]) {
                    alert("Username already exists. Please choose a different one.");
                    return;
                }
                users[username] = { password: password, highestScore: 0 };
                localStorage.setItem("users", JSON.stringify(users));
                alert("Registration successful! Please log in.");
                window.location.href = "login.html";
            } else if (form.id === "loginForm") {
                // Login logic
                if (!users[username] || users[username].password !== password) {
                    alert("Invalid username or password.");
                    return;
                }
                localStorage.setItem("username", username);
                alert("Login successful!");
                window.location.href = "homepage.html";
            }
        }
    }
});
