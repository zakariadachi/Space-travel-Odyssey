// === Utilisateurs simulés ===
const USERS = [
    { email: "user1@space.com", password: "pass1234", name: "Jane Doe" },
    { email: "user2@space.com", password: "moonbase42", name: "John Moon" }
];

// === Clé localStorage ===
const SESSION_KEY = "session";

// === Helpers ===
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

// === Met à jour le header (nom, logout) et cache/affiche lien login ===
function updateHeader() {
    const slot = document.getElementById("account-slot");
    const loginLinks = document.querySelectorAll('a[href*="login"]');
    if (!slot) return;
    slot.innerHTML = "";
    if (isLoggedIn()) {
        const user = getSession();
        slot.classList.remove("hidden");
        slot.innerHTML = `
            <span>Hi, ${user.name}</span>
            <button id="logout-btn" class="ml-4 px-3 py-1 rounded bg-neon-blue text-white font-bold">Logout</button>
        `;
        loginLinks.forEach(a => a.style.display = "none");
        document.getElementById("logout-btn").onclick = function() {
            clearSession();
            updateHeader();
            window.location.reload();
        };
    } else {
        slot.classList.add("hidden");
        loginLinks.forEach(a => a.style.display = "inline");
    }
}

// === Configuration du formulaire login ===
function setupLoginForm() {
    const form = document.getElementById("login-form");
    if (!form) return;
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value.trim();
        const password = form.querySelector('input[type="password"]').value;
        const msg = document.getElementById("login-msg");

        if (!email || !password) {
            if (msg) msg.textContent = "Veuillez saisir votre email et mot de passe.";
            else alert("Veuillez saisir votre email et mot de passe.");
            return;
        }

        const user = findUser(email, password);
        if (!user) {
            if (msg) msg.textContent = "Identifiants incorrects.";
            else alert("Identifiants incorrects.");
            return;
        }

        saveSession(user);
        if (msg) msg.textContent = "Connexion réussie. Redirection...";
        setTimeout(() => {
            window.location.href = "index.html";
        }, 300);
    });
}

// === Protection des pages ===
function protectPage() {
    if (document.body.dataset.protected === "true" && !isLoggedIn()) {
        window.location.href = "login.html";
    }
}

// === Initialisation ===
document.addEventListener("DOMContentLoaded", function() {
    updateHeader();
    setupLoginForm();
    protectPage();
});
