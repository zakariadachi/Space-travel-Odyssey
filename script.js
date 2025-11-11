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


// === Initialisation ===
document.addEventListener("DOMContentLoaded", function() {
    updateHeader();
    setupLoginForm();
    protectPage();
});


// booking.js
document.addEventListener("DOMContentLoaded", () => {
  const destinationSelect = document.getElementById("destination");
  const accommodationCards = document.getElementById("accommodation-cards");
  const packageInput = document.getElementById("package");
  const packageDesc = document.getElementById("package-desc");
  const suitSizeField = document.getElementById("suit-size-field");
  const suitSizeInput = document.getElementById("suit-size");
  const passengersContainer = document.getElementById("passengers-container");
  const addPassengerBtn = document.getElementById("add-passenger-btn");
  const passengerRadios = document.querySelectorAll('input[name="passengers"]');

  let destinationPackages = {};
  let packageFeatures = {};
  let passengerCount = 1, groupMode = false;

  function makePassengerBlock(i) {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#22356a22] rounded-lg p-4 mb-3 border border-[#364583]">
        <div>
          <label>First Name</label>
          <input name="passenger_firstname_${i}" required placeholder="Enter your first name">
        </div>
        <div>
          <label>Last Name</label>
          <input name="passenger_lastname_${i}" required placeholder="Enter your last name">
        </div>
        <div>
          <label>Email Address</label>
          <input type="email" name="passenger_email_${i}" required placeholder="Enter your email">
        </div>
        <div>
          <label>Phone Number</label>
          <input type="tel" name="passenger_phone_${i}" required placeholder="Enter your phone number">
        </div>
      </div>`;
  }

  function renderPassengerForms(count) {
    passengersContainer.innerHTML = "";
    for (let i = 0; i < count; i++) {
      passengersContainer.innerHTML += makePassengerBlock(i);
    }
  }

  fetch("data/booking-options.json")
    .then(res => res.json())
    .then(data => {
      data.spacecraft.forEach(ship => {
        ship.usedFor.forEach(dest => {
          if (!destinationPackages[dest]) destinationPackages[dest] = [];
          destinationPackages[dest].push({
            id: ship.id,
            name: ship.name,
            desc: ship.description,
            features: ship.features || []
          });
          packageFeatures[ship.id] = ship.features || [];
        });
      });

      Object.keys(destinationPackages).sort().forEach(dest => {
        const opt = document.createElement("option");
        opt.value = dest;
        opt.textContent = dest.charAt(0).toUpperCase() + dest.slice(1);
        destinationSelect.appendChild(opt);
      });
    })
    .catch(console.error);

  destinationSelect.addEventListener("change", () => {
    const dest = destinationSelect.value;
    packageInput.value = "";
    packageDesc.textContent = "";
    accommodationCards.innerHTML = "";
    suitSizeField.classList.add("hidden");
    if (!dest) return;

    const selectedPackages = destinationPackages[dest] || [];
    selectedPackages.forEach(pkg => {
      const card = document.createElement("div");
      card.className = "card-acc flex-1";
      card.tabIndex = 0;
      card.dataset.package = pkg.id;
      card.innerHTML = `
        <div class="font-bold text-neon-blue mb-1">${pkg.name}</div>
        <div class="text-xs text-gray-300 min-h-[41px]">${pkg.desc || ""}
        ${packageFeatures[pkg.id]?.includes("moonwalk") ? '<div class="mt-1 text-neon-purple">Includes Moonwalk!</div>' : ""}
        </div>`;
      card.onclick = () => {
        document.querySelectorAll('.card-acc').forEach(d => d.classList.remove('selected'));
        card.classList.add('selected');
        packageInput.value = pkg.id;
        packageDesc.textContent = pkg.desc || "";
        if (packageFeatures[pkg.id]?.includes("moonwalk")) suitSizeField.classList.remove("hidden");
        else suitSizeField.classList.add("hidden");
      };
      accommodationCards.appendChild(card);
    });
  });

  passengerRadios.forEach(radio => {
    radio.addEventListener("change", e => {
      if (e.target.value === "group") {
        passengerCount = 3;
        groupMode = true;
        addPassengerBtn.classList.remove("hidden");
      } else {
        passengerCount = parseInt(e.target.value, 10);
        groupMode = false;
        addPassengerBtn.classList.add("hidden");
      }
      renderPassengerForms(passengerCount);
    });
  });

  addPassengerBtn.addEventListener("click", () => {
    if (groupMode && passengerCount < 6) {
      passengerCount++;
      renderPassengerForms(passengerCount);
    }
  });

  renderPassengerForms(1);

  document.getElementById("booking-form").addEventListener("submit", e => {
    e.preventDefault();
    alert("Booking confirmed! Add your submission logic.");
  });
});
