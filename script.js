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

