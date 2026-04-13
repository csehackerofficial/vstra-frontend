/**
 * VSTRA Authentication Logic (Updated for Email/Phone & Custom Alerts)
 */

const BASE_URL = "https://vstra-backend.onrender.com/api";

// 🌟 Helper for Professional Alerts
const showAlert = (msg, type) => {
    if(window.vastraAlert) vastraAlert(msg, type);
    else alert(msg);
};

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

// ==========================================
// --- SIGN IN (LOGIN) ---
// ==========================================
async function login() {
    // 🌟 FIX 1: Using login_id (can be email or phone)
    const login_id = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!login_id || !password) return showAlert("Please enter Email/Phone and Password", "error");

    const btn = document.querySelector('#loginBox button');
    const oldText = btn.innerText; btn.innerText = "Authenticating..."; btn.disabled = true;

    try {
        const res = await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ login_id, password }) // Sent login_id
        });

        const data = await res.json();
        
        if (data.success) {
            localStorage.setItem("vastra_user", JSON.stringify(data.user));
            showAlert("Login Successful!", "success");
            
            // 🌟 FIX 2: Redirect directly to admin_dashboard.html
            setTimeout(() => {
                if (data.user.role === "admin") {
                    window.location.href = "admin_dashboard.html"; 
                } else {
                    window.location.href = "index.html";
                }
            }, 1000);
        } else {
            showAlert(data.message, "error");
        }
    } catch (err) {
        showAlert("Server is waking up. Try again in 10 seconds.", "error");
    } finally {
        btn.innerText = oldText; btn.disabled = false;
    }
}

// ==========================================
// --- CREATE ACCOUNT (REGISTER) ---
// ==========================================
async function register() {
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    
    // 🌟 FIX 3: Fetching Phone Number
    const phoneInput = document.getElementById("regPhone");
    const phone_number = phoneInput ? phoneInput.value.trim() : "";

    if (!name || !email || !password || !phone_number) {
        return showAlert("All fields including Phone Number are required", "error");
    }

    const btn = document.querySelector('#registerBox button');
    const oldText = btn.innerText; btn.innerText = "Registering..."; btn.disabled = true;

    try {
        const res = await fetch(`${BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, phone_number }) // Sent phone_number
        });

        const data = await res.json();
        
        if (data.success) {
            showAlert(data.message, "success");
            showLogin();
        } else {
            showAlert(data.message, "error");
        }
    } catch (err) {
        showAlert("Registration failed. Server offline.", "error");
    } finally {
        btn.innerText = oldText; btn.disabled = false;
    }
}

// ==========================================
// --- RESET PASSWORD ---
// ==========================================
async function resetPassword() {
    const email = document.getElementById("forgotEmail").value.trim();
    if (!email) return showAlert("Please enter your registered email.", "info");

    const btn = document.querySelector('#forgotBox button');
    const oldText = btn.innerText; btn.innerText = "Sending Link..."; btn.disabled = true;

    try {
        const res = await fetch(`${BASE_URL}/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        showAlert(data.message, data.success ? "success" : "error");
    } catch (err) {
        showAlert("Recovery Terminal Offline.", "error");
    } finally {
        btn.innerText = oldText; btn.disabled = false;
    }
}