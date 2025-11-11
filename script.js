// Utilisateurs simulés
const users = [
    { email: "user1@space.com", password: "pass1234", name: "Jane Doe" },
    { email: "user2@space.com", password: "moonbase42", name: "John Moon" }
];

// Clés de stockage
const SESSION_KEY = "session";
const CREDENTIALS_KEY = "credentials";

// Redirections
const LOGIN_PAGE = "/login.html";
const HOME_PAGE = "/index.html";

// Sauvegarder session
function saveSession(user, remember) {
    const session = {
        loggedIn: true,
        email: user.email,
        name: user.name,
        time: new Date().toISOString()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    if (remember) {
        localStorage.setItem(CREDENTIALS_KEY, JSON.stringify({ email: user.email }));
    } else {
        localStorage.removeItem(CREDENTIALS_KEY);
    }
}

// Charger session
function getSession() {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
}

// Vérifier si connecté
function loggedIn() {
    const session = getSession();
    return session && session.loggedIn;
}

// Supprimer session
function logout() {
    localStorage.removeItem(SESSION_KEY);
}

// Chercher utilisateur
function findUser(email, password) {
    return users.find(u => u.email === email && u.password === password);
}

// Mise à jour du header avec état connexion
function updateNavbar() {
    const slot = document.querySelector("#account-slot");
    const loginLinks = document.querySelectorAll('a[href*="login"]');
    if (loggedIn()) {
        loginLinks.forEach(a => a.style.display = "none");
        if (slot) {
            const session = getSession();
            slot.innerHTML = `Hi, ${session.name} <button id="logout">Logout</button>`;
            slot.style.display = "block";
            document.querySelector("#logout").onclick = () => {
                logout();
                slot.style.display = "none";
                loginLinks.forEach(a => a.style.display = "inline");
            };
        }
    } else {
        loginLinks.forEach(a => a.style.display = "inline");
        if (slot) {
            slot.style.display = "none";
            slot.innerHTML = "";
        }
    }
}

// Protection des pages
function protectPage() {
    if (document.body.dataset.protected === "true" && !loggedIn()) {
        window.location.href = LOGIN_PAGE;
    }
}

// Gestion du formulaire de connexion
function setupLogin() {
    const form = document.querySelector("form");
    if (!form) return;

    if (loggedIn()) {
        window.location.href = HOME_PAGE;
        return;
    }

    const emailField = document.querySelector("input[type=email]");
    const passField = document.querySelector("input[type=password]");
    const rememberField = document.querySelector("input[type=checkbox]");
    const msg = document.querySelector("#login-msg");

    // Remplir email sauvegardé
    const saved = localStorage.getItem(CREDENTIALS_KEY);
    if (saved && emailField) {
        emailField.value = JSON.parse(saved).email || "";
        if (rememberField) rememberField.checked = true;
    }

    form.onsubmit = e => {
        e.preventDefault();
        const email = emailField.value.trim();
        const password = passField.value;
        const remember = rememberField ? rememberField.checked : false;

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

        saveSession(user, remember);

        if (msg) msg.textContent = "Connexion réussie. Redirection...";
        setTimeout(() => window.location.href = HOME_PAGE, 250);
    };
}

// Initialisation au chargement
document.addEventListener("DOMContentLoaded", () => {
    updateNavbar();
    protectPage();
    setupLogin();
});
