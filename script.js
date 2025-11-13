// script.js

// === CONFIGURATION ===
const USERS = [
    { email: "user1@space.com", password: "pass1234", name: "Jane Doe" },
    { email: "user2@space.com", password: "moonbase42", name: "John Moon" }
];

const SESSION_KEY = "session";
const BOOKING_DATA_KEY = "bookingFormData";
const PENDING_BOOKING_KEY = "pendingBooking";
const BOOKINGS_KEY = "userBookings";

// Regex patterns for validation
const patterns = {
  name: /^[A-Za-zÀ-ÿ\s'-]{3,}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+212\s[6-7]\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?$/
};

// Variables globales
let accommodationsData = [];
let destinationsData = [];
let passengerCount = 1;
let maxPassengers = 1;

// === PRICE CALCULATION ===
function calculateTotalPrice() {
    const destinationSelect = document.getElementById("destination");
    const accommodation = document.getElementById("accommodation");
    
    if (!destinationSelect || !destinationSelect.value || !accommodation || !accommodation.value) {
        return 0;
    }
    
    // Get destination price and travel days
    const selectedDestination = destinationsData.find(dest => dest.id === destinationSelect.value);
    if (!selectedDestination) return 0;
    
    const destinationPrice = selectedDestination.price;
    const travelDays = selectedDestination.travelDays || 1;
    
    // Get accommodation price per day
    const selectedAccommodation = accommodationsData.find(acc => acc.id === accommodation.value);
    if (!selectedAccommodation) return 0;
    
    const pricePerDay = selectedAccommodation.pricePerDay;
    
    // Get number of passengers
    const passengerForms = document.querySelectorAll(".passenger-form");
    const numberOfPersons = passengerForms.length;
    
    // Calculate total price: destinationPrice + (travelDays * 2 * pricePerDay * numberOfPersons)
    const totalPrice = destinationPrice + (travelDays * 2 * pricePerDay * numberOfPersons);
    
    return totalPrice;
}

function updatePriceDisplay() {
    const totalPrice = calculateTotalPrice();
    const priceDisplay = document.getElementById("total-price-display");
    const priceAmount = document.getElementById("total-price-amount");
    const priceDetails = document.getElementById("price-details");
    
    if (priceDisplay && priceAmount && totalPrice > 0) {
        const destinationSelect = document.getElementById("destination");
        const accommodation = document.getElementById("accommodation");
        const passengerForms = document.querySelectorAll(".passenger-form");
        
        const selectedDestination = destinationsData.find(dest => dest.id === destinationSelect.value);
        const selectedAccommodation = accommodationsData.find(acc => acc.id === accommodation.value);
        
        if (selectedDestination && selectedAccommodation) {
            const destinationPrice = selectedDestination.price;
            const travelDays = selectedDestination.travelDays || 1;
            const pricePerDay = selectedAccommodation.pricePerDay;
            const numberOfPersons = passengerForms.length;
            
            priceAmount.textContent = `$${totalPrice.toLocaleString()}`;
            
            // Afficher les détails du calcul
            if (priceDetails) {
                priceDetails.innerHTML = `
                    <div class="text-left text-sm space-y-1 mt-2">
                        <div class="flex justify-between">
                            <span>Destination base price:</span>
                            <span>$${destinationPrice.toLocaleString()}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Travel days:</span>
                            <span>${travelDays} days × 2</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Accommodation (${selectedAccommodation.name}):</span>
                            <span>$${pricePerDay.toLocaleString()}/day</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Number of passengers:</span>
                            <span>${numberOfPersons}</span>
                        </div>
                        <div class="border-t border-gray-600 pt-1 mt-1">
                            <div class="flex justify-between font-bold">
                                <span>Total:</span>
                                <span>$${totalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            priceDisplay.classList.remove("hidden");
        }
    } else if (priceDisplay) {
        priceDisplay.classList.add("hidden");
    }
}

function setupPriceCalculation() {
    // Écouter les changements sur tous les éléments qui affectent le prix
    const elementsToWatch = [
        document.getElementById("destination"),
        document.getElementById("departure-date"),
        document.getElementById("accommodation")
    ];
    
    elementsToWatch.forEach(element => {
        if (element) {
            element.addEventListener("change", updatePriceDisplay);
        }
    });
    
    // Écouter les changements de passagers
    document.addEventListener("passengerCountChanged", updatePriceDisplay);
    
    // Écouter les changements sur les radios de passagers
    const passengerRadios = document.querySelectorAll('input[name="passengers"]');
    passengerRadios.forEach(radio => {
        radio.addEventListener("change", function() {
            setTimeout(updatePriceDisplay, 100);
        });
    });
    
    // Mettre à jour initialement
    updatePriceDisplay();
}

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
      let errorMessage = `Invalid ${type}`;
      if (type === 'phone') errorMessage = 'Please use format: +212 6 XX XX XX XX';
      errorDiv.textContent = errorMessage;
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
    const mobileSlot = document.getElementById("mobile-account-slot");
    const loginLinks = document.querySelectorAll('a[href*="login"]');
    const myBookingsLinks = document.querySelectorAll('a[href*="my-bookings"]');
    
    if (slot) {
        slot.innerHTML = "";
        
        if (isLoggedIn()) {
            const user = getSession();
            slot.classList.remove("hidden");
            slot.innerHTML = `
                <span>Hi, ${user.name}</span>
                <button id="logout-btn" class="ml-4 px-3 py-1 rounded bg-neon-blue text-white font-bold">Logout</button>
            `;
            
            loginLinks.forEach(a => a.style.display = "none");
            myBookingsLinks.forEach(a => a.style.display = "inline");
            
            document.getElementById("logout-btn").onclick = function() {
                clearSession();
                updateHeader();
                window.location.reload();
            };
        } else {
            slot.classList.add("hidden");
            loginLinks.forEach(a => a.style.display = "inline");
            myBookingsLinks.forEach(a => a.style.display = "none");
        }
    }
    
    // Update mobile menu
    if (mobileSlot) {
        mobileSlot.innerHTML = "";
        if (isLoggedIn()) {
            const user = getSession();
            mobileSlot.innerHTML = `
                <div class="py-2 border-b border-neon-blue/20">
                    <span class="text-neon-blue">Hi, ${user.name}</span>
                    <button id="mobile-logout-btn" class="ml-2 text-red-400 text-sm">Logout</button>
                </div>
            `;
            document.getElementById("mobile-logout-btn").onclick = function() {
                clearSession();
                updateHeader();
                window.location.reload();
            };
        }
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
            // Rediriger vers la page de réservation si une réservation était en attente
            window.location.href = "booking.html";
        } else {
            window.location.href = "index.html";
        }
    });
}

// === BOOKING MANAGEMENT ===
function saveBooking(bookingData) {
    const bookings = getBookings();
    const newBooking = {
        id: Date.now().toString(),
        ...bookingData,
        bookingDate: new Date().toISOString(),
        status: 'confirmed'
    };
    
    bookings.push(newBooking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    return newBooking;
}

function getBookings() {
    const bookings = localStorage.getItem(BOOKINGS_KEY);
    return bookings ? JSON.parse(bookings) : [];
}

function loadBookings() {
    const container = document.getElementById("bookings-container");
    const totalBookingsEl = document.getElementById("total-bookings");
    const confirmedBookingsEl = document.getElementById("confirmed-bookings");
    const totalSpentEl = document.getElementById("total-spent");
    
    if (!container) return;
    
    const bookings = getBookings();
    
    // Update stats
    if (totalBookingsEl) totalBookingsEl.textContent = bookings.length;
    if (confirmedBookingsEl) confirmedBookingsEl.textContent = bookings.filter(b => b.status === 'confirmed').length;
    
    const totalSpent = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    if (totalSpentEl) totalSpentEl.textContent = `$${totalSpent.toLocaleString()}`;
    
    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <div class="w-24 h-24 rounded-full bg-space-blue/50 flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-rocket text-gray-500 text-3xl"></i>
                </div>
                <h3 class="font-orbitron text-xl text-gray-400 mb-2">No Bookings Yet</h3>
                <p class="text-gray-500 mb-6">Start your space journey by making your first booking!</p>
                <a href="booking.html" class="btn-primary text-white px-8 py-3 rounded-lg font-bold glow inline-block">
                    Book Your Journey
                </a>
            </div>
        `;
        return;
    }
    
    // Afficher les réservations AVEC LE BOUTON PRINT DIRECT
    container.innerHTML = bookings.map(booking => `
        <div class="booking-card p-6 mb-6">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                    <h3 class="font-orbitron text-xl text-neon-blue mb-2">${booking.destinationName}</h3>
                    <p class="text-gray-300">Booking ID: ${booking.id}</p>
                </div>
                <div class="flex items-center space-x-4 mt-2 md:mt-0">
                    <span class="status-${booking.status || 'confirmed'} px-3 py-1 rounded-full text-sm font-bold">
                        ${(booking.status || 'confirmed').charAt(0).toUpperCase() + (booking.status || 'confirmed').slice(1)}
                    </span>
                    <span class="text-2xl font-bold text-neon-cyan">$${(booking.totalPrice || 0).toLocaleString()}</span>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                    <span class="text-gray-400">Departure:</span>
                    <p class="text-white">${new Date(booking.departureDate).toLocaleDateString()}</p>
                </div>
                <div>
                    <span class="text-gray-400">Accommodation:</span>
                    <p class="text-white">${booking.accommodationName}</p>
                </div>
                <div>
                    <span class="text-gray-400">Passengers:</span>
                    <p class="text-white">${booking.passengerCount}</p>
                </div>
                <div>
                    <span class="text-gray-400">Booked on:</span>
                    <p class="text-white">${new Date(booking.bookingDate).toLocaleDateString()}</p>
                </div>
            </div>

            <!-- ⭐⭐⭐ BOUTON PRINT DIRECT ⭐⭐⭐ -->
            <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-neon-blue/20">
                <button onclick="printTicketDirect('${booking.id}')" 
                        class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center glow">
                    <i class="fas fa-print mr-2"></i>
                    Print Ticket
                </button>
            </div>

            <div class="border-t border-neon-blue/20 pt-4">
                <h4 class="font-orbitron text-lg mb-2">Passengers</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    ${(booking.passengers || []).map(passenger => `
                        <div class="bg-space-dark/50 p-3 rounded">
                            <p class="text-white font-semibold">${passenger.firstName} ${passenger.lastName}</p>
                            <p class="text-gray-400 text-sm">${passenger.email}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Fonction pour imprimer directement sans modal
function printTicketDirect(bookingId) {
    const bookings = getBookings();
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) {
        alert('Booking not found');
        return;
    }

    // Générer le contenu du ticket
    const ticketContent = generateTicketContent(booking);
    
    // Créer une fenêtre d'impression directement
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    // HTML complet pour l'impression
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>SpaceVoyager - Boarding Ticket</title>
            <meta charset="UTF-8">
            <style>
                @page {
                    margin: 0.5cm;
                    size: A4;
                }
                
                body {
                    font-family: 'Arial', sans-serif;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                    background: white;
                }
                
                .ticket-container {
                    max-width: 800px;
                    margin: 0 auto;
                    border: 3px solid #0ea5e9;
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                }
                
                .ticket-header {
                    background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
                    color: white;
                    padding: 25px;
                }
                
                .ticket-body {
                    padding: 30px;
                    background: white;
                }
                
                .section {
                    margin-bottom: 25px;
                }
                
                .section h3 {
                    color: #0ea5e9;
                    border-bottom: 2px solid #0ea5e9;
                    padding-bottom: 8px;
                    margin-bottom: 15px;
                    font-size: 18px;
                    font-weight: bold;
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                }
                
                .info-item {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px solid #eee;
                    padding: 10px 0;
                    font-size: 14px;
                }
                
                .info-item strong {
                    color: #555;
                }
                
                .passenger-card {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 12px;
                }
                
                .passenger-card.primary {
                    border-left: 4px solid #0ea5e9;
                }
                
                .barcode {
                    text-align: center;
                    margin: 25px 0;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    border: 1px dashed #ccc;
                }
                
                .notes {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 25px 0;
                }
                
                .notes h4 {
                    color: #856404;
                    margin: 0 0 12px 0;
                    font-size: 16px;
                }
                
                .notes ul {
                    margin: 0;
                    padding-left: 20px;
                    font-size: 13px;
                    color: #856404;
                }
                
                .notes li {
                    margin-bottom: 5px;
                }
                
                .perforation {
                    background: repeating-linear-gradient(
                        to right,
                        transparent,
                        transparent 5px,
                        #0ea5e9 5px,
                        #0ea5e9 10px
                    );
                    height: 2px;
                    margin: 20px 0;
                }
                
                .ticket-footer {
                    background: #f8f9fa;
                    padding: 15px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                    border-top: 1px solid #dee2e6;
                }
                
                @media print {
                    body { 
                        margin: 0; 
                        padding: 0;
                    }
                    .ticket-container { 
                        box-shadow: none; 
                        border: 3px solid #000;
                        margin: 0;
                    }
                    .no-print { display: none !important; }
                }
                
                @media (max-width: 768px) {
                    .info-grid {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                }
            </style>
        </head>
        <body>
            ${ticketContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Attendre que le contenu soit chargé puis imprimer
    setTimeout(() => {
        printWindow.print();
        // Optionnel: Fermer la fenêtre après un délai
        setTimeout(() => {
            printWindow.close();
            // Afficher un message de confirmation
            alert('Ticket sent to printer!');
        }, 500);
    }, 1000);
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
                    <input type="tel" name="phone[]" placeholder="+212 6 XX XX XX XX" required data-validation="phone" />
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
        // Fallback data si le fichier n'existe pas
        const fallbackData = {
            accommodations: [
                {
                    id: "basic",
                    name: "Standard Cabin",
                    shortDescription: "Comfortable private space with basic amenities",
                    size: "15 m²",
                    occupancy: "1-2 persons",
                    pricePerDay: 500
                },
                {
                    id: "deluxe",
                    name: "Deluxe Suite",
                    shortDescription: "Spacious suite with premium amenities and view",
                    size: "30 m²",
                    occupancy: "1-4 persons",
                    pricePerDay: 1200
                },
                {
                    id: "luxury",
                    name: "Luxury Apartment",
                    shortDescription: "Ultimate comfort with private facilities",
                    size: "50 m²",
                    occupancy: "1-6 persons",
                    pricePerDay: 2500
                }
            ]
        };

        let data;
        try {
            const response = await fetch("data/accommodations.json");
            if (response.ok) {
                data = await response.json();
            } else {
                data = fallbackData;
            }
        } catch (error) {
            data = fallbackData;
        }
        
        accommodationsData = data.accommodations;
        console.log("Accommodations loaded:", accommodationsData.length);
    } catch (error) {
        console.error("Error loading accommodations:", error);
    }
}

async function loadDestinations() {
    try {
        // Fallback data si le fichier n'existe pas
        const fallbackData = {
            destinations: [
                {
                    id: "moon",
                    name: "The Moon",
                    description: "Experience Earth's closest celestial neighbor with breathtaking views of our home planet.",
                    travelDuration: "3 days",
                    travelDays: 3,
                    distance: "384,400 km",
                    gravity: "0.16g",
                    temperature: "-173°C to 127°C",
                    price: 25000,
                    currency: "USD",
                    accommodations: ["basic", "deluxe", "luxury"]
                },
                {
                    id: "mars",
                    name: "Mars",
                    description: "Visit the red planet and explore its magnificent landscapes and ancient valleys.",
                    travelDuration: "9 months",
                    travelDays: 270,
                    distance: "225 million km",
                    gravity: "0.38g",
                    temperature: "-87°C to -5°C",
                    price: 150000,
                    currency: "USD",
                    accommodations: ["deluxe", "luxury"]
                },
                {
                    id: "europa",
                    name: "Europa",
                    description: "Journey to Jupiter's icy moon with potential subsurface oceans and unique geology.",
                    travelDuration: "5 years",
                    travelDays: 1825,
                    distance: "628 million km",
                    gravity: "0.13g",
                    temperature: "-160°C",
                    price: 450000,
                    currency: "USD",
                    accommodations: ["luxury"]
                },
                {
                    id: "titan",
                    name: "Titan",
                    description: "Explore Saturn's largest moon with its thick atmosphere and methane lakes.",
                    travelDuration: "7 years",
                    travelDays: 2555,
                    distance: "1.4 billion km",
                    gravity: "0.14g",
                    temperature: "-179°C",
                    price: 600000,
                    currency: "USD",
                    accommodations: ["luxury"]
                }
            ]
        };

        let data;
        try {
            const response = await fetch("data/destinations.json");
            if (response.ok) {
                data = await response.json();
            } else {
                data = fallbackData;
            }
        } catch (error) {
            data = fallbackData;
        }

        destinationsData = data.destinations;

        const destinationSelect = document.getElementById("destination");
        if (!destinationSelect) return;
        
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
            
            updatePriceDisplay();
        });
    } catch (error) {
        console.error("Error loading destinations:", error);
    }
}

function showAccommodationsForDestination(destination) {
    const accommodationsContainer = document.getElementById("accommodations-container");
    const accommodationInput = document.getElementById("accommodation");

    if (!accommodationsContainer || !accommodationInput) return;

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
    updatePriceDisplay();
}

// === FORM MANAGEMENT ===
function saveFormData() {
    const formData = {
        destination: document.getElementById("destination")?.value || "",
        departureDate: document.getElementById("departure-date")?.value || "",
        passengers: document.querySelector('input[name="passengers"]:checked')?.value || "solo",
        accommodation: document.getElementById("accommodation")?.value || "",
        passengerForms: [],
    };

    const passengerForms = document.querySelectorAll(".passenger-form");
    passengerForms.forEach((form) => {
        const passengerData = {
            firstName: form.querySelector('input[name="first-name[]"]')?.value || "",
            lastName: form.querySelector('input[name="last-name[]"]')?.value || "",
            email: form.querySelector('input[name="email[]"]')?.value || "",
            phone: form.querySelector('input[name="phone[]"]')?.value || "",
            specialRequirements: form.querySelector('textarea[name="special-requirements[]"]')?.value || "",
        };
        formData.passengerForms.push(passengerData);
    });

    localStorage.setItem(BOOKING_DATA_KEY, JSON.stringify(formData));
}

function loadFormData() {
    const savedData = localStorage.getItem(BOOKING_DATA_KEY);
    if (!savedData) return;

    const formData = JSON.parse(savedData);
    
    // Restaurer les données du formulaire
    if (formData.destination) {
        document.getElementById("destination").value = formData.destination;
        document.getElementById("destination").dispatchEvent(new Event('change'));
    }
    
    if (formData.departureDate) {
        document.getElementById("departure-date").value = formData.departureDate;
    }
    
    if (formData.passengers) {
        const radio = document.querySelector(`input[name="passengers"][value="${formData.passengers}"]`);
        if (radio) radio.checked = true;
        updateMaxPassengers();
    }
    
    if (formData.accommodation) {
        document.getElementById("accommodation").value = formData.accommodation;
        const card = document.querySelector(`.accommodation-card[data-type="${formData.accommodation}"]`);
        if (card) {
            document.querySelectorAll(".accommodation-card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
        }
    }
    
    // Restaurer les données des passagers
    if (formData.passengerForms && formData.passengerForms.length > 0) {
        // Supprimer les formulaires de passagers existants sauf le premier
        const passengerForms = document.querySelectorAll(".passenger-form");
        for (let i = passengerForms.length - 1; i > 0; i--) {
            passengerForms[i].remove();
        }
        
        passengerCount = 1;
        
        // Ajouter les formulaires supplémentaires
        for (let i = 1; i < formData.passengerForms.length; i++) {
            addPassengerForm();
        }
        
        // Remplir les données
        const allPassengerForms = document.querySelectorAll(".passenger-form");
        formData.passengerForms.forEach((passenger, index) => {
            if (allPassengerForms[index]) {
                const form = allPassengerForms[index];
                form.querySelector('input[name="first-name[]"]').value = passenger.firstName;
                form.querySelector('input[name="last-name[]"]').value = passenger.lastName;
                form.querySelector('input[name="email[]"]').value = passenger.email;
                form.querySelector('input[name="phone[]"]').value = passenger.phone;
                form.querySelector('textarea[name="special-requirements[]"]').value = passenger.specialRequirements;
            }
        });
    }
    
    updatePriceDisplay();
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
    if (!destination || destination.value === "") {
        showError(destination, "Please select a destination");
        isValid = false;
    } else {
        clearError("destination-error");
    }

    const departureDate = document.getElementById("departure-date");
    if (!departureDate || departureDate.value === "") {
        showError(departureDate, "Please select a departure date");
        isValid = false;
    } else {
        clearError("departure-date-error");
    }

    const accommodation = document.getElementById("accommodation");
    if (!accommodation || accommodation.value === "") {
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
    if (!input) return;
    
    const errorElement = input.parentNode?.querySelector(".error-message");
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = "block";
    }
    input.classList.add("input-error");
    input.classList.remove("input-success");
}

// === MOBILE MENU ===
function setupMobileMenu() {
    const mobileMenuButton = document.getElementById("mobile-menu-button");
    const mobileMenu = document.getElementById("mobile-menu");
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener("click", function() {
            mobileMenu.classList.toggle("open");
        });
    }
}

// === INITIALISATION ===
document.addEventListener("DOMContentLoaded", function() {
    updateHeader();
    setupLoginForm();
    setupMobileMenu();
    
    // Page spécifique: Booking
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

        const addPassengerBtn = document.getElementById("add-passenger-btn");
        if (addPassengerBtn) {
            addPassengerBtn.addEventListener("click", addPassengerForm);
        }

        updateMaxPassengers();
        
        Promise.all([loadAccommodations(), loadDestinations()]).then(() => {
            setupAutoSave();
            setupPriceCalculation();
            loadFormData(); // Charger les données sauvegardées
        });

        const bookingForm = document.getElementById("booking-form");
        if (bookingForm) {
            bookingForm.addEventListener("submit", function(e) {
                e.preventDefault();
                
                if (!validateForm()) {
                    alert("Please fix the errors in the form before submitting.");
                    return;
                }
                
                if (!isLoggedIn()) {
                    saveFormData();
                    localStorage.setItem(PENDING_BOOKING_KEY, "true");
                    alert("Please login to complete your booking");
                    window.location.href = "login.html";
                    return;
                }
                
                // Préparer les données de réservation
                const destinationSelect = document.getElementById("destination");
                const selectedDestination = destinationsData.find(dest => dest.id === destinationSelect.value);
                const selectedAccommodation = accommodationsData.find(acc => acc.id === document.getElementById("accommodation").value);
                
                const passengers = [];
                const passengerForms = document.querySelectorAll(".passenger-form");
                passengerForms.forEach((form) => {
                    passengers.push({
                        firstName: form.querySelector('input[name="first-name[]"]').value,
                        lastName: form.querySelector('input[name="last-name[]"]').value,
                        email: form.querySelector('input[name="email[]"]').value,
                        phone: form.querySelector('input[name="phone[]"]').value,
                        specialRequirements: form.querySelector('textarea[name="special-requirements[]"]').value
                    });
                });
                
                const bookingData = {
                    destinationName: selectedDestination.name,
                    accommodationName: selectedAccommodation.name,
                    departureDate: document.getElementById("departure-date").value,
                    passengerCount: passengers.length,
                    passengers: passengers,
                    totalPrice: calculateTotalPrice()
                };
                
                // Sauvegarder la réservation
                saveBooking(bookingData);
                
                alert("Booking confirmed! Thank you for your reservation.");
                localStorage.removeItem(BOOKING_DATA_KEY);
                localStorage.removeItem(PENDING_BOOKING_KEY);
                
                // Rediriger vers la page des réservations
                window.location.href = "my-bookings.html";
            });
        }
    }
    
    // Page spécifique: My Bookings
    if (window.location.pathname.includes("my-bookings.html")) {
        createStars();
        loadBookings();
        
        // Exposer la fonction refreshBookings globalement pour le bouton
        window.refreshBookings = refreshBookings;
    }
    
    // Page spécifique: Login - Vérifier s'il y a une réservation en attente
    if (window.location.pathname.includes("login.html")) {
        const pendingBooking = localStorage.getItem(PENDING_BOOKING_KEY);
        if (pendingBooking) {
            const loginCard = document.querySelector('.login-card');
            if (loginCard) {
                const notice = document.createElement('div');
                notice.className = 'bg-neon-blue/20 border border-neon-blue text-neon-blue p-3 rounded-lg mb-6 text-sm';
                notice.innerHTML = '<i class="fas fa-info-circle mr-2"></i> You have a pending booking. Please login to complete it.';
                loginCard.insertBefore(notice, loginCard.firstChild);
            }
        }
    }
});


// === TICKET PRINTING FROM MY BOOKINGS ===

// // Fonction pour afficher le ticket dans un modal
// function viewTicket(bookingId) {
//     const bookings = getBookings();
//     const booking = bookings.find(b => b.id === bookingId);
    
//     if (!booking) {
//         alert('Booking not found');
//         return;
//     }

//     // Générer le contenu du ticket
//     const ticketContent = generateTicketContent(booking);
    
//     // Afficher le modal
//     const printModal = document.getElementById('print-modal');
//     const printContent = document.getElementById('print-content');
    
//     if (!printModal || !printContent) {
//         console.error('Print modal elements not found');
//         return;
//     }
    
//     printContent.innerHTML = ticketContent;
//     printModal.classList.remove('hidden');
    
//     // Empêcher le scroll du body
//     document.body.style.overflow = 'hidden';
// }

// // Fonction pour fermer le modal
// function closePrintModal() {
//     const printModal = document.getElementById('print-modal');
//     if (printModal) {
//         printModal.classList.add('hidden');
//         document.body.style.overflow = 'auto';
//     }
// }

// // Fonction pour déclencher l'impression
// function printTicket() {
//     const printContent = document.getElementById('print-content');
    
//     if (!printContent) {
//         alert('No ticket content to print');
//         return;
//     }

//     // Créer une fenêtre d'impression
//     const printWindow = window.open('', '_blank', 'width=800,height=600');
    
//     // HTML complet pour l'impression
//     printWindow.document.write(`
//         <!DOCTYPE html>
//         <html>
//         <head>
//             <title>SpaceVoyager - Boarding Ticket</title>
//             <meta charset="UTF-8">
//             <style>
//                 @page {
//                     margin: 0.5cm;
//                     size: A4;
//                 }
                
//                 body {
//                     font-family: 'Arial', sans-serif;
//                     margin: 0;
//                     padding: 20px;
//                     color: #000;
//                     background: white;
//                 }
                
//                 .ticket-container {
//                     max-width: 800px;
//                     margin: 0 auto;
//                     border: 3px solid #0ea5e9;
//                     border-radius: 15px;
//                     overflow: hidden;
//                     box-shadow: 0 10px 30px rgba(0,0,0,0.1);
//                 }
                
//                 .ticket-header {
//                     background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
//                     color: white;
//                     padding: 25px;
//                 }
                
//                 .ticket-body {
//                     padding: 30px;
//                     background: white;
//                 }
                
//                 .section {
//                     margin-bottom: 25px;
//                 }
                
//                 .section h3 {
//                     color: #0ea5e9;
//                     border-bottom: 2px solid #0ea5e9;
//                     padding-bottom: 8px;
//                     margin-bottom: 15px;
//                     font-size: 18px;
//                     font-weight: bold;
//                 }
                
//                 .info-grid {
//                     display: grid;
//                     grid-template-columns: 1fr 1fr;
//                     gap: 30px;
//                 }
                
//                 .info-item {
//                     display: flex;
//                     justify-content: space-between;
//                     border-bottom: 1px solid #eee;
//                     padding: 10px 0;
//                     font-size: 14px;
//                 }
                
//                 .info-item strong {
//                     color: #555;
//                 }
                
//                 .passenger-card {
//                     background: #f8f9fa;
//                     border: 1px solid #dee2e6;
//                     border-radius: 8px;
//                     padding: 15px;
//                     margin-bottom: 12px;
//                 }
                
//                 .passenger-card.primary {
//                     border-left: 4px solid #0ea5e9;
//                 }
                
//                 .barcode {
//                     text-align: center;
//                     margin: 25px 0;
//                     padding: 20px;
//                     background: #f8f9fa;
//                     border-radius: 10px;
//                     border: 1px dashed #ccc;
//                 }
                
//                 .notes {
//                     background: #fff3cd;
//                     border: 1px solid #ffeaa7;
//                     border-radius: 8px;
//                     padding: 20px;
//                     margin: 25px 0;
//                 }
                
//                 .notes h4 {
//                     color: #856404;
//                     margin: 0 0 12px 0;
//                     font-size: 16px;
//                 }
                
//                 .notes ul {
//                     margin: 0;
//                     padding-left: 20px;
//                     font-size: 13px;
//                     color: #856404;
//                 }
                
//                 .notes li {
//                     margin-bottom: 5px;
//                 }
                
//                 .perforation {
//                     background: repeating-linear-gradient(
//                         to right,
//                         transparent,
//                         transparent 5px,
//                         #0ea5e9 5px,
//                         #0ea5e9 10px
//                     );
//                     height: 2px;
//                     margin: 20px 0;
//                 }
                
//                 .ticket-footer {
//                     background: #f8f9fa;
//                     padding: 15px;
//                     text-align: center;
//                     font-size: 12px;
//                     color: #666;
//                     border-top: 1px solid #dee2e6;
//                 }
                
//                 @media print {
//                     body { 
//                         margin: 0; 
//                         padding: 0;
//                     }
//                     .ticket-container { 
//                         box-shadow: none; 
//                         border: 3px solid #000;
//                         margin: 0;
//                     }
//                     .no-print { display: none !important; }
//                 }
                
//                 @media (max-width: 768px) {
//                     .info-grid {
//                         grid-template-columns: 1fr;
//                         gap: 20px;
//                     }
//                 }
//             </style>
//         </head>
//         <body>
//             ${printContent.innerHTML}
//         </body>
//         </html>
//     `);
    
//     printWindow.document.close();
//     printWindow.focus();
    
//     // Attendre que le contenu soit chargé puis imprimer
//     setTimeout(() => {
//         printWindow.print();
//         // Optionnel: Fermer la fenêtre après un délai
//         setTimeout(() => {
//             printWindow.close();
//         }, 500);
//     }, 1000);
// }

// Fonction pour générer le contenu HTML du ticket
function generateTicketContent(booking) {
    const flightNumber = generateFlightNumber(booking.destinationName);
    const barcode = `SV${booking.id.slice(-8)}`;
    const departureDate = new Date(booking.departureDate);
    const formattedDate = departureDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    return `
        <div class="ticket-container">
            <!-- Header -->
            <div class="ticket-header">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <div style="width: 70px; height: 70px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px;">
                            🚀
                        </div>
                        <div>
                            <h1 style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px;">SPACEVOYAGER</h1>
                            <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Interplanetary Travel Company</p>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0; font-size: 14px; opacity: 0.9;">BOARDING PASS</p>
                        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">
                            SV-${booking.id.slice(-6).toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Perforation -->
            <div class="perforation"></div>

            <!-- Body -->
            <div class="ticket-body">
                <!-- Flight & Passenger Info -->
                <div class="info-grid">
                    <!-- Flight Information -->
                    <div class="section">
                        <h3>🚀 FLIGHT INFORMATION</h3>
                        <div class="info-item"><strong>Flight Number:</strong> <span style="font-family: monospace; font-weight: bold;">${flightNumber}</span></div>
                        <div class="info-item"><strong>Destination:</strong> ${booking.destinationName}</div>
                        <div class="info-item"><strong>Departure Date:</strong> ${formattedDate}</div>
                        <div class="info-item"><strong>Travel Duration:</strong> ${getDestinationDuration(booking.destinationName)}</div>
                        <div class="info-item"><strong>Accommodation:</strong> ${booking.accommodationName}</div>
                        <div class="info-item"><strong>Total Passengers:</strong> ${booking.passengerCount}</div>
                        <div class="info-item"><strong>Total Price:</strong> $${booking.totalPrice.toLocaleString()}</div>
                    </div>

                    <!-- Passenger Information -->
                    <div class="section">
                        <h3>👥 PASSENGER INFORMATION</h3>
                        ${booking.passengers.map((passenger, index) => `
                            <div class="passenger-card ${index === 0 ? 'primary' : ''}">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                    <div>
                                        <strong style="font-size: 16px; display: block;">${passenger.firstName} ${passenger.lastName}</strong>
                                        <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                            <div>📧 ${passenger.email}</div>
                                            <div>📞 ${passenger.phone}</div>
                                        </div>
                                    </div>
                                    <span style="background: ${index === 0 ? '#0ea5e9' : '#6c757d'}; color: white; padding: 4px 12px; border-radius: 15px; font-size: 11px; font-weight: bold;">
                                        ${index === 0 ? 'PRIMARY' : `PASSENGER ${index + 1}`}
                                    </span>
                                </div>
                                ${passenger.specialRequirements ? `
                                    <div style="font-size: 12px; color: #e74c3c; margin-top: 8px; padding: 8px; background: #ffeaea; border-radius: 4px;">
                                        <strong>Special Requirements:</strong> ${passenger.specialRequirements}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Important Notes -->
                <div class="notes">
                    <h4>📋 IMPORTANT NOTES & REQUIREMENTS</h4>
                    <ul>
                        <li><strong>Check-in:</strong> Opens 3 hours before departure at SpacePort Alpha</li>
                        <li><strong>Identification:</strong> Valid government-issued ID required for all passengers</li>
                        <li><strong>Training:</strong> Zero-gravity training must be completed 48 hours before flight</li>
                        <li><strong>Medical:</strong> Medical clearance certificate must be presented at check-in</li>
                        <li><strong>Baggage:</strong> Limit: 15kg personal + 5kg cabin baggage</li>
                        <li><strong>Documents:</strong> Bring printed ticket and all required travel documents</li>
                    </ul>
                </div>

                <!-- Barcode -->
                <div class="barcode">
                    <div style="font-size: 12px; color: #666; margin-bottom: 8px; font-weight: bold;">SCAN AT SECURITY CHECKPOINT</div>
                    <div style="display: flex; justify-content: center; gap: 3px; margin-bottom: 15px;">
                        ${generateBarcodePattern()}
                    </div>
                    <div style="font-family: 'Courier New', monospace; font-size: 16px; letter-spacing: 3px; font-weight: bold; color: #333;">
                        ${barcode}
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="ticket-footer">
                <p style="margin: 0 0 8px 0;">
                    <strong>For assistance:</strong> +1 (800) SPACE-TRIP | support@spacevoyager.com
                </p>
                <p style="margin: 0; font-size: 11px;">
                    Ticket issued electronically on ${new Date().toLocaleDateString()} • Please present this document at check-in
                </p>
            </div>
        </div>
    `;
}

// Fonction pour générer un motif de code-barres
function generateBarcodePattern() {
    const bars = [];
    for (let i = 0; i < 12; i++) {
        const width = Math.floor(Math.random() * 3) + 1;
        const height = Math.floor(Math.random() * 10) + 30;
        bars.push(`<div style="width: ${width}px; height: ${height}px; background: black;"></div>`);
    }
    return bars.join('');
}

// Fonction pour générer un numéro de vol
function generateFlightNumber(destination) {
    const prefixes = {
        'moon': 'SV-LUN',
        'mars': 'SV-MRS', 
        'europa': 'SV-EUR',
        'titan': 'SV-TIT'
    };
    
    const key = destination.toLowerCase().replace('the ', '').replace(/\s/g, '');
    const prefix = prefixes[key] || 'SV-INT';
    const randomSuffix = Math.random().toString(36).substr(2, 4).toUpperCase();
    
    return `${prefix}-${randomSuffix}`;
}

// Fonction pour obtenir la durée du voyage
function getDestinationDuration(destinationName) {
    const durations = {
        'moon': '3 days',
        'mars': '9 months',
        'europa': '5 years', 
        'titan': '7 years'
    };
    
    const key = destinationName.toLowerCase().replace('the ', '');
    return durations[key] || 'Unknown duration';
}

// Gestion de la fermeture du modal avec la touche Escape
// document.addEventListener('keydown', function(event) {
//     if (event.key === 'Escape') {
//         closePrintModal();
//     }
// });

// Gestion du clic en dehors du modal pour fermer
// document.addEventListener('click', function(event) {
//     const printModal = document.getElementById('print-modal');
//     if (printModal && !printModal.classList.contains('hidden')) {
//         if (event.target === printModal) {
//             closePrintModal();
//         }
//     }
// });

// === FONCTIONS DE GESTION DES RÉSERVATIONS ===

// Fonction pour obtenir toutes les réservations
function getBookings() {
    const bookings = localStorage.getItem('userBookings');
    return bookings ? JSON.parse(bookings) : [];
}

// Fonction pour rafraîchir l'affichage des réservations
function refreshBookings() {
    loadBookings();
    alert('Bookings refreshed successfully!');
}

// Fonction pour charger et afficher les réservations
function loadBookings() {
    const container = document.getElementById('bookings-container');
    const totalBookingsEl = document.getElementById('total-bookings');
    const confirmedBookingsEl = document.getElementById('confirmed-bookings');
    const totalSpentEl = document.getElementById('total-spent');
    
    if (!container) return;
    
    const bookings = getBookings();
    
    // Mettre à jour les statistiques
    if (totalBookingsEl) totalBookingsEl.textContent = bookings.length;
    if (confirmedBookingsEl) confirmedBookingsEl.textContent = bookings.filter(b => b.status === 'confirmed').length;
    
    const totalSpent = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    if (totalSpentEl) totalSpentEl.textContent = `$${totalSpent.toLocaleString()}`;
    
    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <div class="w-24 h-24 rounded-full bg-space-blue/50 flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-rocket text-gray-500 text-3xl"></i>
                </div>
                <h3 class="font-orbitron text-xl text-gray-400 mb-2">No Bookings Yet</h3>
                <p class="text-gray-500 mb-6">Start your space journey by making your first booking!</p>
                <a href="booking.html" class="btn-primary text-white px-8 py-3 rounded-lg font-bold glow inline-block">
                    Book Your Journey
                </a>
            </div>
        `;
        return;
    }
    
    // Afficher les réservations avec le bouton View Ticket
    container.innerHTML = bookings.map(booking => `
        <div class="booking-card p-6 mb-6">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                    <h3 class="font-orbitron text-xl text-neon-blue mb-2">${booking.destinationName}</h3>
                    <p class="text-gray-300">Booking ID: ${booking.id}</p>
                </div>
                <div class="flex items-center space-x-4 mt-2 md:mt-0">
                    <span class="status-${booking.status || 'confirmed'} px-3 py-1 rounded-full text-sm font-bold">
                        ${(booking.status || 'confirmed').charAt(0).toUpperCase() + (booking.status || 'confirmed').slice(1)}
                    </span>
                    <span class="text-2xl font-bold text-neon-cyan">$${(booking.totalPrice || 0).toLocaleString()}</span>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                    <span class="text-gray-400">Departure:</span>
                    <p class="text-white">${new Date(booking.departureDate).toLocaleDateString()}</p>
                </div>
                <div>
                    <span class="text-gray-400">Accommodation:</span>
                    <p class="text-white">${booking.accommodationName}</p>
                </div>
                <div>
                    <span class="text-gray-400">Passengers:</span>
                    <p class="text-white">${booking.passengerCount}</p>
                </div>
                <div>
                    <span class="text-gray-400">Booked on:</span>
                    <p class="text-white">${new Date(booking.bookingDate).toLocaleDateString()}</p>
                </div>
            </div>

            <!-- ⭐⭐⭐ AJOUTEZ LE BOUTON PRINT ICI ⭐⭐⭐ -->
            <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-neon-blue/20">
                <button onclick="printTicketDirect('${booking.id}')" 
                        class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center glow">
                    <i class="fas fa-print mr-2"></i>
                    Print Ticket
                </button>
            </div>

            <div class="border-t border-neon-blue/20 pt-4">
                <h4 class="font-orbitron text-lg mb-2">Passengers</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    ${(booking.passengers || []).map(passenger => `
                        <div class="bg-space-dark/50 p-3 rounded">
                            <p class="text-white font-semibold">${passenger.firstName} ${passenger.lastName}</p>
                            <p class="text-gray-400 text-sm">${passenger.email}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Charger les réservations si on est sur la page My Bookings
    if (window.location.pathname.includes('my-bookings.html')) {
        loadBookings();
    }
});

// === FONCTIONS DE GESTION DE SESSION (si nécessaires) ===

function isLoggedIn() {
    const session = localStorage.getItem('session');
    return session ? JSON.parse(session).isLoggedIn : false;
}

function getSession() {
    const session = localStorage.getItem('session');
    return session ? JSON.parse(session) : null;
}

// Exposer les fonctions globalement
// window.viewTicket = viewTicket;
// window.closePrintModal = closePrintModal;
// window.printTicket = printTicket;
// window.refreshBookings = refreshBookings;
// Dans la section d'initialisation, ajoutez :
window.printTicketDirect = printTicketDirect;

