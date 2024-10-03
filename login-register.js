document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("registerForm") || document.getElementById("loginForm");
    
    if (form) {
        form.onsubmit = function(e) {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword") ? document.getElementById("confirmPassword").value : null;
            const loadingDiv = document.getElementById("loading");

            loadingDiv.style.display = "flex";
            
            let users = JSON.parse(localStorage.getItem("users")) || {};
            
            if (form.id === "registerForm") {
                if (password !== confirmPassword) {
                    alert("Passwords do not match. Please try again.");
                    loadingDiv.style.display = "none"; 
                    return;
                }

                if (users[username]) {
                    alert("Username already exists. Please choose a different one.");
                    loadingDiv.style.display = "none"; 
                    return;
                }

                users[username] = { password: password, highestScore: 0 };
                localStorage.setItem("users", JSON.stringify(users));

                alert("Registration successful! Please wait...");
                
                setTimeout(() => {
                    window.location.href = "login.html"; 
                    loadingDiv.style.display = "none"; 
                }, 1500); 

            } else if (form.id === "loginForm") {
                if (!users[username] || users[username].password !== password) {
                    alert("Invalid username or password.");
                    loadingDiv.style.display = "none"; 
                    return;
                }

                localStorage.setItem("username", username);

                alert("Login successful! Please wait...");
                
                setTimeout(() => {
                    window.location.href = "homepage.html"; 
                    loadingDiv.style.display = "none"; 
                }, 1500); 
            }
        }
    }
});
