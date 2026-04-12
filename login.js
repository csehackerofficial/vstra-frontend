/**
 * VSTRA Authentication Logic
 */

const BASE_URL = "https://vstra-backend.onrender.com/api";

function showRegister() {
    document.getElementById("loginBox").classList.remove("active");
    document.getElementById("registerBox").classList.add("active");
    document.getElementById("forgotBox").classList.remove("active");
}

function showLogin() {
    document.getElementById("loginBox").classList.add("active");
    document.getElementById("registerBox").classList.remove("active");
    document.getElementById("forgotBox").classList.remove("active");
}

function showForgot() {
    document.getElementById("loginBox").classList.remove("active");
    document.getElementById("registerBox").classList.remove("active");
    document.getElementById("forgotBox").classList.add("active");
}

// --- SIGN IN (LOGIN) ---
async function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) return alert("Please enter Email and Password");

    try {
        const res = await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        
        if (data.success) {
            localStorage.setItem("vastra_user", JSON.stringify(data.user));
            // Redirect based on role
            if (data.user.role === "admin") {
                window.location.href = "adminlogin.html"; 
            } else {
                window.location.href = "index.html";
            }
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert("Server not responding. Start your Node.js server first.");
    }
}

// --- CREATE ACCOUNT (REGISTER) ---
async function register() {
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    if (!name || !email || !password) return alert("All fields are required");

    try {
        const res = await fetch(`${BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();
        alert(data.message);
        
        if (data.success) showLogin();
    } catch (err) {
        alert("Registration failed. Check server.");
    }
}

// --- RESET PASSWORD ---
async function resetPassword() {
    const email = document.getElementById("forgotEmail").value;
    if (!email) return alert("Please enter your registered email.");

    try {
        const res = await fetch(`${BASE_URL}/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        alert(data.message);
    } catch (err) {
        alert("Recovery Terminal Offline.");
    }
}