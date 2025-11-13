// === CONFIGURATION ===
const USERS = [
    { email: "user1@space.com", password: "pass1234", name: "Jane Doe" },
    { email: "user2@space.com", password: "moonbase42", name: "John Moon" }
];

const SESSION_KEY = "session";
const BOOKING_DATA_KEY = "bookingFormData";
const PENDING_BOOKING_KEY = "pendingBooking";

// Regex patterns for validation
const patterns = {
  name: /^[A-Za-zÀ-ÿ\s'-]{2,30}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?\d{7,15}$/
};

// Variables globales
let accommodationsData = [];
let destinationsData = [];
let passengerCount = 1;
let maxPassengers = 1;


// === VALIDATION SYSTEM ===
function validateField(input) {
  const type = input.dataset.validation;
  const value = input.value.trim();
  const errorDiv = input.parentNode.querySelector(".error-message");
  let valid = true;

  if (!value) {
    if (errorDiv) {
      errorDiv.textContent = "This field is required";
      errorDiv.style.display = "block";
    }
    input.classList.add("input-error");
    input.classList.remove("input-success");
    valid = false;
  } else if (patterns[type] && !patterns[type].test(value)) {
    if (errorDiv) {
      errorDiv.textContent = `Invalid ${type}`;
      errorDiv.style.display = "block";
    }
    input.classList.add("input-error");
    input.classList.remove("input-success");
    valid = false;
  } else {
    if (errorDiv) {
      errorDiv.textContent = "";
      errorDiv.style.display = "none";
    }
    input.classList.remove("input-error");
    input.classList.add("input-success");
  }

  return valid;
}

function attachValidation(input) {
  input.addEventListener("blur", () => validateField(input));
  input.addEventListener("input", () => {
    const errorDiv = input.parentNode.querySelector(".error-message");
    if (errorDiv) {
      errorDiv.style.display = "none";
    }
    input.classList.remove("input-error");
  });
}

function setupInputValidation() {
  const inputs = document.querySelectorAll("input[data-validation]");
  inputs.forEach((input) => {
    attachValidation(input);
  });
}

// === SESSION MANAGEMENT ===
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

// === UI MANAGEMENT ===
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

function setupLoginForm() {
    const form = document.getElementById("login-form");
    if (!form) return;
    
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        
        const email = form.querySelector('input[type="email"]').value.trim();
        const password = form.querySelector('input[type="password"]').value;

        if (!email || !password) {
            alert("Please enter email and password.");
            return;
        }

        const user = findUser(email, password);
        if (!user) {
            alert("Invalid credentials.");
            return;
        }

        saveSession(user);        
        const pendingBooking = localStorage.getItem(PENDING_BOOKING_KEY);
        if (pendingBooking) {
            window.location.href = "booking.html";
        } else {
            window.location.href = "index.html";
        }
    });
}

// === BOOKING PAGE FUNCTIONS ===
function createStars() {
    const container = document.getElementById("stars-container");
    if (!container) return;
    
    const starCount = 150;
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(star);
    }
}

function setupAccommodationCardSelection() {
    const accommodationCards = document.querySelectorAll(".accommodation-card");
    const accommodationInput = document.getElementById("accommodation");

    accommodationCards.forEach((card) => {
        card.addEventListener("click", function () {
            accommodationCards.forEach((c) => c.classList.remove("selected"));
            this.classList.add("selected");
            accommodationInput.value = this.dataset.type;
            clearError("accommodation-error");
        });
    });
}

function getPassengerType() {
    const selected = document.querySelector('input[name="passengers"]:checked');
    return selected ? selected.value : "solo";
}

function updateMaxPassengers() {
    const passengerType = getPassengerType();
    
    switch (passengerType) {
        case "solo":
            maxPassengers = 1;
            break;
        case "couple":
            maxPassengers = 2;
            break;
        case "group":
            maxPassengers = 6;
            break;
    }

    const addButton = document.getElementById("add-passenger-btn");
    if (passengerType === "solo") {
        addButton.style.display = "none";
    } else {
        addButton.style.display = "block";
        addButton.textContent = `Add Passenger`;
    }

    const passengerForms = document.querySelectorAll(".passenger-form");
    if (passengerForms.length > maxPassengers) {
        for (let i = passengerForms.length - 1; i >= maxPassengers; i--) {
            passengerForms[i].remove();
        }
        passengerCount = maxPassengers;
    }
}

// === PASSENGER MANAGEMENT ===
function addPassengerForm() {
    if (passengerCount < maxPassengers) {
        passengerCount++;

        const container = document.getElementById("passenger-forms-container");
        const newForm = document.createElement("div");
        newForm.className = "passenger-form";
        newForm.id = `passenger-form-${passengerCount}`;

        newForm.innerHTML = `
            <div class="passenger-header">
                <h3 class="font-orbitron text-neon-blue">Passenger ${passengerCount}</h3>
                <div class="remove-passenger" data-index="${passengerCount}">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label class="block mb-2 text-gray-300">First Name</label>
                    <input type="text" name="first-name[]" placeholder="Enter passenger first name" required data-validation="name" />
                    <div class="error-message" data-error="first-name"></div>
                </div>
                <div>
                    <label class="block mb-2 text-gray-300">Last Name</label>
                    <input type="text" name="last-name[]" placeholder="Enter passenger last name" required data-validation="name" />
                    <div class="error-message" data-error="last-name"></div>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label class="block mb-2 text-gray-300">Email Address</label>
                    <input type="email" name="email[]" placeholder="Enter passenger email" required data-validation="email" />
                    <div class="error-message" data-error="email"></div>
                </div>
                <div>
                    <label class="block mb-2 text-gray-300">Phone Number</label>
                    <input type="tel" name="phone[]" placeholder="Enter passenger phone number" required data-validation="phone" />
                    <div class="error-message" data-error="phone"></div>
                </div>
            </div>
            <div class="mb-6">
                <label class="block mb-2 text-gray-300">Special Requirements</label>
                <textarea class="pl-3 pt-1" name="special-requirements[]" rows="4" placeholder="Any special requirements..."></textarea>
            </div>
        `;

        container.appendChild(newForm);

        const newInputs = newForm.querySelectorAll("input[data-validation]");
        newInputs.forEach(input => attachValidation(input));

        const removeButton = newForm.querySelector(".remove-passenger");
        removeButton.addEventListener("click", function () {
            const index = parseInt(this.getAttribute("data-index"));
            removePassengerForm(index);
        });
        
        document.dispatchEvent(new CustomEvent("passengerCountChanged"));
    }
}

function removePassengerForm(index) {
    const formToRemove = document.getElementById(`passenger-form-${index}`);
    if (formToRemove) {
        formToRemove.remove();
        passengerCount--;
        
        const passengerForms = document.querySelectorAll(".passenger-form");
        passengerForms.forEach((form, i) => {
            if (i > 0) {
                form.id = `passenger-form-${i + 1}`;
                const header = form.querySelector(".passenger-header h3");
                header.textContent = `Passenger ${i + 1}`;
                const removeButton = form.querySelector(".remove-passenger");
                removeButton.setAttribute("data-index", i + 1);
            }
        });
        
        document.dispatchEvent(new CustomEvent("passengerCountChanged"));
    }
}

// === DATA LOADING ===
async function loadAccommodations() {
    try {
        const response = await fetch("data/accommodations.json");
        if (!response.ok) throw new Error(`Failed to load accommodations: ${response.status}`);
        const data = await response.json();
        accommodationsData = data.accommodations;
        console.log("Accommodations loaded:", accommodationsData.length);
    } catch (error) {
        console.error("Error loading accommodations:", error);
        alert("Unable to load accommodations. Please try again later.");
    }
}

async function loadDestinations() {
    try {
        const response = await fetch("data/destinations.json");
        if (!response.ok) throw new Error(`Failed to load destinations: ${response.status}`);
        const data = await response.json();
        destinationsData = data.destinations;

        const destinationSelect = document.getElementById("destination");
        
        while (destinationSelect.children.length > 1) {
            destinationSelect.removeChild(destinationSelect.lastChild);
        }

        destinationsData.forEach((dest) => {
            const option = document.createElement("option");
            option.value = dest.id;
            option.textContent = `${dest.name} - ${dest.travelDuration} - From $${dest.price.toLocaleString()}`;
            option.setAttribute("data-destination", JSON.stringify(dest));
            destinationSelect.appendChild(option);
        });

        destinationSelect.addEventListener("change", function () {
            const selectedOption = this.options[this.selectedIndex];
            const destinationInfo = document.getElementById("destination-info");
            const accommodationsSection = document.getElementById("accommodations-section");

            if (selectedOption.value) {
                const dest = JSON.parse(selectedOption.getAttribute("data-destination"));
                
                document.getElementById("destination-name").textContent = dest.name;
                document.getElementById("destination-description").textContent = dest.description;
                document.getElementById("destination-duration").textContent = dest.travelDuration;
                document.getElementById("destination-distance").textContent = dest.distance;
                document.getElementById("destination-gravity").textContent = dest.gravity;
                document.getElementById("destination-temperature").textContent = dest.temperature;
                document.getElementById("destination-price").textContent = `$${dest.price.toLocaleString()} ${dest.currency}`;

                destinationInfo.classList.remove("hidden");
                showAccommodationsForDestination(dest);
                accommodationsSection.classList.add("visible");
            } else {
                destinationInfo.classList.add("hidden");
                accommodationsSection.classList.remove("visible");
            }
        });
    } catch (error) {
        console.error("Error loading destinations:", error);
        alert("Unable to load destinations. Please try again later.");
    }
}

function showAccommodationsForDestination(destination) {
    const accommodationsContainer = document.getElementById("accommodations-container");
    const accommodationInput = document.getElementById("accommodation");

    accommodationsContainer.innerHTML = "";
    const availableAccommodationIds = destination.accommodations || [];
    const availableAccommodations = accommodationsData.filter((acc) =>
        availableAccommodationIds.includes(acc.id)
    );

    availableAccommodations.forEach((acc, index) => {
        const card = document.createElement("div");
        card.className = `accommodation-card ${index === 0 ? "selected" : ""}`;
        card.dataset.type = acc.id;

        card.innerHTML = `
            <h3 class="font-orbitron text-neon-blue mb-2">${acc.name}</h3>
            <p class="text-sm text-gray-400">${acc.shortDescription}</p>
            <div class="mt-3 text-xs text-gray-500">
                <div class="flex justify-between mb-1"><span>Size:</span><span>${acc.size}</span></div>
                <div class="flex justify-between mb-1"><span>Occupancy:</span><span>${acc.occupancy}</span></div>
                <div class="flex justify-between"><span>Price:</span><span class="font-bold text-neon-cyan">$${acc.pricePerDay}/day</span></div>
            </div>
        `;

        accommodationsContainer.appendChild(card);
    });

    if (availableAccommodations.length > 0) {
        accommodationInput.value = availableAccommodations[0].id;
    }

    setupAccommodationCardSelection();
}

// === FORM MANAGEMENT ===
function saveFormData() {
    const formData = {
        destination: document.getElementById("destination").value,
        departureDate: document.getElementById("departure-date").value,
        passengers: document.querySelector('input[name="passengers"]:checked').value,
        accommodation: document.getElementById("accommodation").value,
        passengerForms: [],
    };

    const passengerForms = document.querySelectorAll(".passenger-form");
    passengerForms.forEach((form) => {
        const passengerData = {
            firstName: form.querySelector('input[name="first-name[]"]').value,
            lastName: form.querySelector('input[name="last-name[]"]').value,
            email: form.querySelector('input[name="email[]"]').value,
            phone: form.querySelector('input[name="phone[]"]').value,
            specialRequirements: form.querySelector('textarea[name="special-requirements[]"]').value,
        };
        formData.passengerForms.push(passengerData);
    });

    localStorage.setItem(BOOKING_DATA_KEY, JSON.stringify(formData));
}

function setupAutoSave() {
    const elements = document.querySelectorAll("input, select, textarea");
    elements.forEach((element) => {
        element.addEventListener("input", function() {
            saveFormData();
            updatePriceDisplay();
        });
        element.addEventListener("change", function() {
            saveFormData();
            updatePriceDisplay();
        });
    });

    document.querySelectorAll('input[type="radio"]').forEach((radio) => {
        radio.addEventListener("change", function() {
            saveFormData();
            setTimeout(updatePriceDisplay, 100);
        });
    });

    document.addEventListener("click", function (e) {
        if (e.target.closest(".accommodation-card")) {
            setTimeout(function() {
                saveFormData();
                updatePriceDisplay();
            }, 100);
        }
    });
}

function clearError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = "";
        errorElement.style.display = "none";
    }
}

function validateForm() {
    let isValid = true;

    const destination = document.getElementById("destination");
    if (destination.value === "") {
        showError(destination, "Please select a destination");
        isValid = false;
    } else {
        clearError("destination-error");
    }

    const departureDate = document.getElementById("departure-date");
    if (departureDate.value === "") {
        showError(departureDate, "Please select a departure date");
        isValid = false;
    } else {
        clearError("departure-date-error");
    }

    const accommodation = document.getElementById("accommodation");
    if (accommodation.value === "") {
        showError(accommodation, "Please select an accommodation type");
        isValid = false;
    } else {
        clearError("accommodation-error");
    }

    const passengerForms = document.querySelectorAll(".passenger-form");
    passengerForms.forEach((form) => {
        const inputs = form.querySelectorAll("input[data-validation]");
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });
    });

    return isValid;
}

function showError(input, message) {
    const errorElement = input.parentNode.querySelector(".error-message");
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = "block";
    }
    input.classList.add("input-error");
    input.classList.remove("input-success");
}

// === INITIALISATION ===
document.addEventListener("DOMContentLoaded", function() {
    updateHeader();
    setupLoginForm();
    
    if (window.location.pathname.includes("booking.html")) {
        createStars();
        
        setupInputValidation();
        
        const passengerRadios = document.querySelectorAll('input[name="passengers"]');
        passengerRadios.forEach((radio) => {
            radio.addEventListener("change", function () {
                updateMaxPassengers();
                saveFormData();
            });
        });

        document.getElementById("add-passenger-btn").addEventListener("click", addPassengerForm);

        updateMaxPassengers();
        
        Promise.all([loadAccommodations(), loadDestinations()]).then(() => {
            setupAutoSave();
            setupPriceCalculation();
        });

        document.getElementById("booking-form").addEventListener("submit", function(e) {
            e.preventDefault();
            
            if (!validateForm()) {
                return;
            }
            
            if (!isLoggedIn()) {
                saveFormData();
                localStorage.setItem(PENDING_BOOKING_KEY, "true");
                alert("Please login to complete your booking");
                window.location.href = "login.html";
                return;
            }
            
            alert("Booking confirmed! Thank you for your reservation.");
            localStorage.removeItem(BOOKING_DATA_KEY);
            localStorage.removeItem(PENDING_BOOKING_KEY);
            this.reset();
        });
    }
    
});