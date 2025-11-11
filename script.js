// ==== Fake Users ====
const USERS = [
    { email: "user1@space.com", password: "pass1234", name: "Jane Doe" },
    { email: "user2@space.com", password: "moonbase42", name: "John Moon" }
];

// ==== Storage Keys ====
const SESSION_KEY = "session";

// ==== Simple Session Helpers ====
function findUser(email, password) {
    return USERS.find(u => u.email === email && u.password === password);
}

function saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
        isLoggedIn: true,
        email: user.email,
        name: user.name,
        loginAt: new Date().toISOString()
    }));
}

function getSession() {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

function isLoggedIn() {
    const s = getSession();
    return s && s.isLoggedIn;
}

// ==== Header UI: Show user or logout ====
function updateHeader() {
    const slot = document.getElementById("account-slot");
    if (!slot) return;
    slot.innerHTML = ""; // Clean
    if (isLoggedIn()) {
        const user = getSession();
        slot.classList.remove("hidden");
        slot.innerHTML = `
            <span>Hi, ${user.name}</span>
            <button id="logout-btn" class="ml-4 px-3 py-1 rounded bg-neon-blue text-white font-bold">Logout</button>
        `;
        document.getElementById("logout-btn").onclick = function() {
            clearSession();
            updateHeader();
            window.location.reload(); // Option: refresh to update UI
        };
    } else {
        slot.classList.add("hidden");
    }
}

// ==== Login Form Logic ====
function setupLoginForm() {
    const form = document.getElementById("login-form");
    if (!form) return;
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value.trim();
        const password = form.querySelector('input[type="password"]').value;
        const msg = document.getElementById("login-msg");

        if (!email || !password) {
            if (msg) msg.textContent = "Please enter email and password.";
            else alert("Please enter email and password.");
            return;
        }

        const user = findUser(email, password);
        if (!user) {
            if (msg) msg.textContent = "Invalid credentials.";
            else alert("Invalid credentials.");
            return;
        }
        saveSession(user);
        if (msg) msg.textContent = "Login successful! Redirecting...";
        setTimeout(() => {
            window.location.href = "index.html";
        }, 300);
    });
}

// ==== On page load ====
document.addEventListener("DOMContentLoaded", function() {
    updateHeader();
    setupLoginForm();
    // Page protection (optional)
    if (document.body.dataset.protected === "true" && !isLoggedIn()) {
        window.location.href = "login.html";
    }
});
