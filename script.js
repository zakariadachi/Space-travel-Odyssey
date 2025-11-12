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


// Global variables to store data//
      let accommodationsData = [];
      let destinationsData = [];
      let passengerCount = 1; // Start with 1 (primary passenger)
      let maxPassengers = 1; // Will be set based on selection

      // Create stars background
// function createStars() {
        // const container = document.getElementById("stars-container");
        // const starCount = 150;

        // for (let i = 0; i < starCount; i++) {
        //   const star = document.createElement("div");
        //   star.classList.add("star");

        //   const size = Math.random() * 2 + 1;
        //   star.style.width = `${size}px`;
        //   star.style.height = `${size}px`;

        //   star.style.left = `${Math.random() * 100}%`;
        //   star.style.top = `${Math.random() * 100}%`;

        //   star.style.animationDelay = `${Math.random() * 5}s`;

        //   container.appendChild(star);
        // }

      // Mobile menu toggle
      // document
      //   .getElementById("mobile-menu-button")
      //   .addEventListener("click", function () {
      //     const menu = document.getElementById("mobile-menu");
      //     menu.classList.toggle("open");
      //   });

      // Accommodation card selection
      function setupAccommodationCardSelection() {
        const accommodationCards = document.querySelectorAll(
          ".accommodation-card"
        );
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

      // Form validation functions
      function validateName(name) {
        const nameRegex = /^[a-zA-Z\s]{2,50}$/;
        return nameRegex.test(name.trim());
      }

      function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
      }

      function validatePhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ""));
      }

      function validateDate(date) {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      }

      // Show error message
      function showError(input, message) {
        const errorElement = input.parentNode.querySelector(".error-message");
        errorElement.textContent = message;
        errorElement.style.display = "block";
        input.classList.add("input-error");
        input.classList.remove("input-success");
      }

      // Clear error message
      function clearError(errorId) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
          errorElement.textContent = "";
          errorElement.style.display = "none";
        }
      }

      // Show success state
      function showSuccess(input) {
        const errorElement = input.parentNode.querySelector(".error-message");
        errorElement.style.display = "none";
        input.classList.remove("input-error");
        input.classList.add("input-success");
      }

      // Validate input on blur
      function setupInputValidation() {
        const inputs = document.querySelectorAll("input[data-validation]");

        inputs.forEach((input) => {
          input.addEventListener("blur", function () {
            validateInput(this);
          });

          input.addEventListener("input", function () {
            // Clear error as user types
            if (this.value.trim() !== "") {
              const errorElement =
                this.parentNode.querySelector(".error-message");
              errorElement.style.display = "none";
              this.classList.remove("input-error");
            }
          });
        });
      }

      // Validate individual input
      function validateInput(input) {
        const value = input.value.trim();
        const validationType = input.getAttribute("data-validation");

        if (value === "") {
          showError(input, "This field is required");
          return false;
        }

        let isValid = false;
        let errorMessage = "";

        switch (validationType) {
          case "name":
            isValid = validateName(value);
            errorMessage =
              "Please enter a valid name (2-50 characters, letters only)";
            break;
          case "email":
            isValid = validateEmail(value);
            errorMessage = "Please enter a valid email address";
            break;
          case "phone":
            isValid = validatePhone(value);
            errorMessage = "Please enter a valid phone number";
            break;
        }

        if (!isValid) {
          showError(input, errorMessage);
          return false;
        } else {
          showSuccess(input);
          return true;
        }
      }

      // Validate entire form
      function validateForm() {
        let isValid = true;

        // Validate destination
        const destination = document.getElementById("destination");
        if (destination.value === "") {
          showError(destination, "Please select a destination");
          isValid = false;
        } else {
          clearError("destination-error");
        }

        // Validate departure date
        const departureDate = document.getElementById("departure-date");
        if (departureDate.value === "") {
          showError(departureDate, "Please select a departure date");
          isValid = false;
        } else if (!validateDate(departureDate.value)) {
          showError(
            departureDate,
            "Departure date must be today or in the future"
          );
          isValid = false;
        } else {
          clearError("departure-date-error");
        }

        // Validate accommodation
        const accommodation = document.getElementById("accommodation");
        if (accommodation.value === "") {
          showError(accommodation, "Please select an accommodation type");
          isValid = false;
        } else {
          clearError("accommodation-error");
        }

        // Validate passenger forms
        const passengerForms = document.querySelectorAll(".passenger-form");
        passengerForms.forEach((form, index) => {
          const firstName = form.querySelector('input[name="first-name[]"]');
          const lastName = form.querySelector('input[name="last-name[]"]');
          const email = form.querySelector('input[name="email[]"]');
          const phone = form.querySelector('input[name="phone[]"]');

          if (!validateInput(firstName)) isValid = false;
          if (!validateInput(lastName)) isValid = false;
          if (!validateInput(email)) isValid = false;
          if (!validateInput(phone)) isValid = false;
        });

        return isValid;
      }

      // Add passenger form
      document
        .getElementById("add-passenger-btn")
        .addEventListener("click", function () {
          if (passengerCount < maxPassengers) {
            addPassengerForm();
          } else {
            showMaxPassengerModal();
          }
        });

      // Get passenger type based on selection
      function getPassengerType() {
        const selected = document.querySelector(
          'input[name="passengers"]:checked'
        );
        return selected ? selected.value : "solo";
      }

      // Update max passengers based on selection
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

        // Update button text
        const addButton = document.getElementById("add-passenger-btn");
        if (passengerType === "solo") {
          addButton.style.display = "none";
        } else {
          addButton.style.display = "block";
          addButton.textContent = `Add Passenger`;
        }

        // Remove extra forms if needed
        const passengerForms = document.querySelectorAll(".passenger-form");
        if (passengerForms.length > maxPassengers) {
          for (let i = passengerForms.length - 1; i >= maxPassengers; i--) {
            passengerForms[i].remove();
          }
          passengerCount = maxPassengers;
        }
      }

      // Add passenger form
      function addPassengerForm() {
        if (passengerCount < maxPassengers) {
          passengerCount++;

          const container = document.getElementById(
            "passenger-forms-container"
          );
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
          <!-- First Name -->
          <div>
            <label class="block mb-2 text-gray-300">First Name</label>
            <input
              type="text"
              name="first-name[]"
              placeholder="Enter passenger first name"
              required
              data-validation="name"
            />
            <div class="error-message" data-error="first-name"></div>
          </div>

          <!-- Last Name -->
          <div>
            <label class="block mb-2 text-gray-300">Last Name</label>
            <input
              type="text"
              name="last-name[]"
              placeholder="Enter passenger last name"
              required
              data-validation="name"
            />
            <div class="error-message" data-error="last-name"></div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Email -->
          <div>
            <label class="block mb-2 text-gray-300">Email Address</label>
            <input
              type="email"
              name="email[]"
              placeholder="Enter passenger email"
              required
              data-validation="email"
            />
            <div class="error-message" data-error="email"></div>
          </div>

          <!-- Phone -->
          <div>
            <label class="block mb-2 text-gray-300">Phone Number</label>
            <input
              type="tel"
              name="phone[]"
              placeholder="Enter passenger phone number"
              required
              data-validation="phone"
            />
            <div class="error-message" data-error="phone"></div>
          </div>
        </div>

        <!-- Special Requirements -->
        <div class="mb-6">
          <label class="block mb-2 text-gray-300"
            >Special Requirements</label
          >
          <textarea
            class="pl-3 pt-1"
            name="special-requirements[]"
            rows="4"
            placeholder="Any special requirements or notes..."
          ></textarea>
        </div>
      `;

          container.appendChild(newForm);

          // Update button text
          document.getElementById(
            "add-passenger-btn"
          ).textContent = `Add Passenger`;

          // Setup validation for new inputs
          setupInputValidation();

          // Add event listener for remove button
          const removeButton = newForm.querySelector(".remove-passenger");
          removeButton.addEventListener("click", function () {
            const index = parseInt(this.getAttribute("data-index"));
            removePassengerForm(index);
          });
        }
      }

      // Remove passenger form
      function removePassengerForm(index) {
        const formToRemove = document.getElementById(`passenger-form-${index}`);
        if (formToRemove) {
          formToRemove.remove();
          passengerCount--;

          // Update button text
          document.getElementById(
            "add-passenger-btn"
          ).textContent = `Add Passenger`;

          // Renumber remaining forms
          const passengerForms = document.querySelectorAll(".passenger-form");
          passengerForms.forEach((form, i) => {
            if (i > 0) {
              // Skip primary passenger
              form.id = `passenger-form-${i + 1}`;
              const header = form.querySelector(".passenger-header h3");
              header.textContent = `Passenger ${i + 1}`;

              const removeButton = form.querySelector(".remove-passenger");
              removeButton.setAttribute("data-index", i + 1);
            }
          });
        }
      }

      // Show max passenger modal
      function showMaxPassengerModal() {
        // Create modal if it doesn't exist
        let modal = document.getElementById("max-passenger-modal");

        if (!modal) {
          modal = document.createElement("div");
          modal.id = "max-passenger-modal";
          modal.className =
            "fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm";
          modal.innerHTML = `
        <div class="form-container max-w-md mx-4 p-6 relative">
          <div class="text-center mb-6">
            <div class="w-16 h-16 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple flex items-center justify-center mx-auto mb-4 glow">
              <i class="fas fa-users text-white text-xl"></i>
            </div>
            <h3 class="font-orbitron text-2xl mb-2 text-glow">Maximum Passengers Reached</h3>
            <p class="text-gray-300">You've reached the maximum number of passengers for ${getPassengerType()} travel (${maxPassengers} ${
            maxPassengers === 1 ? "person" : "people"
          }).</p>
          </div>
          <div class="flex justify-center">
            <button id="modal-ok-btn" class="btn-primary text-white px-6 py-3 rounded-lg font-bold">
              Understood
            </button>
          </div>
        </div>
      `;
          document.body.appendChild(modal);

          // Add event listener for the OK button
          document
            .getElementById("modal-ok-btn")
            .addEventListener("click", function () {
              modal.remove();
            });

          // Close modal when clicking outside
          modal.addEventListener("click", function (e) {
            if (e.target === modal) {
              modal.remove();
            }
          });
        }

        // Show the modal
        modal.style.display = "flex";
      }

      // Load accommodations from JSON
      async function loadAccommodations() {
        try {
          const response = await fetch("data/accommodations.json");

          if (!response.ok) {
            throw new Error(
              `Failed to load accommodations: ${response.status}`
            );
          }

          const data = await response.json();
          accommodationsData = data.accommodations;

          console.log("Accommodations loaded:", accommodationsData);
        } catch (error) {
          console.error("Error loading accommodations:", error);
          alert("Unable to load accommodations. Please try again later.");
        }
      }

      // Load destinations from JSON
      async function loadDestinations() {
        try {
          const response = await fetch("data/destinations.json");

          if (!response.ok) {
            throw new Error(`Failed to load destinations: ${response.status}`);
          }

          const data = await response.json();
          destinationsData = data.destinations;

          const destinationSelect = document.getElementById("destination");

          // Clear existing options except the first one
          while (destinationSelect.children.length > 1) {
            destinationSelect.removeChild(destinationSelect.lastChild);
          }

          // Add destinations from JSON
          destinationsData.forEach((dest) => {
            const option = document.createElement("option");
            option.value = dest.id;
            option.textContent = `${dest.name} - ${
              dest.travelDuration
            } - From $${dest.price.toLocaleString()}`;
            option.setAttribute("data-destination", JSON.stringify(dest));
            destinationSelect.appendChild(option);
          });

          // Add event listener to show destination info when selected
          destinationSelect.addEventListener("change", function () {
            const selectedOption = this.options[this.selectedIndex];
            const destinationInfo = document.getElementById("destination-info");
            const accommodationsSection = document.getElementById(
              "accommodations-section"
            );

            if (selectedOption.value) {
              const dest = JSON.parse(
                selectedOption.getAttribute("data-destination")
              );

              // Update destination info display
              document.getElementById("destination-name").textContent =
                dest.name;
              document.getElementById("destination-description").textContent =
                dest.description;
              document.getElementById("destination-duration").textContent =
                dest.travelDuration;
              document.getElementById("destination-distance").textContent =
                dest.distance;
              document.getElementById("destination-gravity").textContent =
                dest.gravity;
              document.getElementById("destination-temperature").textContent =
                dest.temperature;
              document.getElementById(
                "destination-price"
              ).textContent = `$${dest.price.toLocaleString()} ${
                dest.currency
              }`;

              // Show the destination info
              destinationInfo.classList.remove("hidden");

              // Show and populate accommodations for this destination
              showAccommodationsForDestination(dest);
              accommodationsSection.classList.add("visible");
            } else {
              // Hide the destination info and accommodations
              destinationInfo.classList.add("hidden");
              accommodationsSection.classList.remove("visible");
            }
          });
        } catch (error) {
          console.error("Error loading destinations:", error);

          // Fallback: You can add some default options here if the fetch fails
          const destinationSelect = document.getElementById("destination");
          const fallbackOption = document.createElement("option");
          fallbackOption.value = "";
          fallbackOption.textContent = "Unable to load destinations";
          fallbackOption.disabled = true;
          destinationSelect.appendChild(fallbackOption);

          // Show error message to user
          alert("Unable to load destinations. Please try again later.");
        }
      }

      // Show accommodations for selected destination
      function showAccommodationsForDestination(destination) {
        const accommodationsContainer = document.getElementById(
          "accommodations-container"
        );
        const accommodationInput = document.getElementById("accommodation");

        // Clear existing accommodation cards
        accommodationsContainer.innerHTML = "";

        // Get available accommodation IDs for this destination
        const availableAccommodationIds = destination.accommodations || [];

        // Filter accommodations to show only those available at this destination
        const availableAccommodations = accommodationsData.filter((acc) =>
          availableAccommodationIds.includes(acc.id)
        );

        // Create accommodation cards
        availableAccommodations.forEach((acc, index) => {
          const card = document.createElement("div");
          card.className = `accommodation-card ${
            index === 0 ? "selected" : ""
          }`;
          card.dataset.type = acc.id;

          card.innerHTML = `
        <h3 class="font-orbitron text-neon-blue mb-2">${acc.name}</h3>
        <p class="text-sm text-gray-400">${acc.shortDescription}</p>
        <div class="mt-3 text-xs text-gray-500">
          <div class="flex justify-between mb-1">
            <span>Size:</span>
            <span>${acc.size}</span>
          </div>
          <div class="flex justify-between mb-1">
            <span>Occupancy:</span>
            <span>${acc.occupancy}</span>
          </div>
          <div class="flex justify-between">
            <span>Price:</span>
            <span class="font-bold text-neon-cyan">$${acc.pricePerDay}/day</span>
          </div>
        </div>
      `;

          accommodationsContainer.appendChild(card);
        });

        // Set the first accommodation as selected by default
        if (availableAccommodations.length > 0) {
          accommodationInput.value = availableAccommodations[0].id;
        }

        // Set up event listeners for the new accommodation cards
        setupAccommodationCardSelection();
      }

      // Save form data to localStorage
      function saveFormData() {
        const formData = {
          destination: document.getElementById("destination").value,
          departureDate: document.getElementById("departure-date").value,
          passengers: document.querySelector('input[name="passengers"]:checked')
            .value,
          accommodation: document.getElementById("accommodation").value,
          passengerForms: [],
        };

        // Save passenger form data
        const passengerForms = document.querySelectorAll(".passenger-form");
        passengerForms.forEach((form, index) => {
          const passengerData = {
            firstName: form.querySelector('input[name="first-name[]"]').value,
            lastName: form.querySelector('input[name="last-name[]"]').value,
            email: form.querySelector('input[name="email[]"]').value,
            phone: form.querySelector('input[name="phone[]"]').value,
            specialRequirements: form.querySelector(
              'textarea[name="special-requirements[]"]'
            ).value,
          };
          formData.passengerForms.push(passengerData);
        });

        localStorage.setItem("bookingFormData", JSON.stringify(formData));
      }

      // Restore form data from localStorage
      function restoreFormData() {
        const savedData = localStorage.getItem("bookingFormData");
        if (!savedData) return;

        const formData = JSON.parse(savedData);

        // Restore basic form fields
        if (formData.destination) {
          document.getElementById("destination").value = formData.destination;
          // Trigger change event to load accommodations
          document
            .getElementById("destination")
            .dispatchEvent(new Event("change"));
        }

        if (formData.departureDate) {
          document.getElementById("departure-date").value =
            formData.departureDate;
        }

        if (formData.passengers) {
          const passengerRadio = document.querySelector(
            `input[name="passengers"][value="${formData.passengers}"]`
          );
          if (passengerRadio) {
            passengerRadio.checked = true;
            updateMaxPassengers();
          }
        }

        // Restore passenger forms after a delay to ensure accommodations are loaded
        setTimeout(() => {
          if (formData.accommodation) {
            document.getElementById("accommodation").value =
              formData.accommodation;
            // Select the accommodation card
            const accommodationCard = document.querySelector(
              `.accommodation-card[data-type="${formData.accommodation}"]`
            );
            if (accommodationCard) {
              document
                .querySelectorAll(".accommodation-card")
                .forEach((card) => card.classList.remove("selected"));
              accommodationCard.classList.add("selected");
            }
          }

          // Restore passenger forms
          if (formData.passengerForms && formData.passengerForms.length > 0) {
            // Remove all passenger forms except the primary one
            const passengerForms = document.querySelectorAll(".passenger-form");
            for (let i = passengerForms.length - 1; i > 0; i--) {
              passengerForms[i].remove();
            }

            // Restore primary passenger data
            const primaryPassenger = formData.passengerForms[0];
            if (primaryPassenger) {
              const primaryForm = document.getElementById("passenger-form-0");
              primaryForm.querySelector('input[name="first-name[]"]').value =
                primaryPassenger.firstName || "";
              primaryForm.querySelector('input[name="last-name[]"]').value =
                primaryPassenger.lastName || "";
              primaryForm.querySelector('input[name="email[]"]').value =
                primaryPassenger.email || "";
              primaryForm.querySelector('input[name="phone[]"]').value =
                primaryPassenger.phone || "";
              primaryForm.querySelector(
                'textarea[name="special-requirements[]"]'
              ).value = primaryPassenger.specialRequirements || "";
            }

            // Add and restore additional passenger forms
            for (let i = 1; i < formData.passengerForms.length; i++) {
              if (i < maxPassengers) {
                addPassengerForm();
                const passengerData = formData.passengerForms[i];
                const passengerForm = document.getElementById(
                  `passenger-form-${i + 1}`
                );

                if (passengerForm && passengerData) {
                  passengerForm.querySelector(
                    'input[name="first-name[]"]'
                  ).value = passengerData.firstName || "";
                  passengerForm.querySelector(
                    'input[name="last-name[]"]'
                  ).value = passengerData.lastName || "";
                  passengerForm.querySelector('input[name="email[]"]').value =
                    passengerData.email || "";
                  passengerForm.querySelector('input[name="phone[]"]').value =
                    passengerData.phone || "";
                  passengerForm.querySelector(
                    'textarea[name="special-requirements[]"]'
                  ).value = passengerData.specialRequirements || "";
                }
              }
            }
          }
        }, 500); // Delay to ensure accommodations are loaded
      }

      // Clear form data from localStorage (optional - can be called after successful submission)
      function clearFormData() {
        localStorage.removeItem("bookingFormData");
      }

      // Add event listeners to save form data on input
      function setupAutoSave() {
        // Save on input for text fields
        document
          .querySelectorAll("input, select, textarea")
          .forEach((element) => {
            element.addEventListener("input", saveFormData);
            element.addEventListener("change", saveFormData);
          });

        // Save on radio button change
        document.querySelectorAll('input[type="radio"]').forEach((radio) => {
          radio.addEventListener("change", saveFormData);
        });

        // Save when accommodation is selected
        document.addEventListener("click", function (e) {
          if (e.target.closest(".accommodation-card")) {
            setTimeout(saveFormData, 100);
          }
        });
      }

      // Check if user is logged in
      function isUserLoggedIn() {
        return localStorage.getItem("currentUser") !== null;
      }

      // Get current user
      function getCurrentUser() {
        const user = localStorage.getItem("currentUser");
        return user ? JSON.parse(user) : null;
      }

      // Save booking to user's reservations
      function saveBookingToUser(bookingData) {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          console.error("No current user found");
          return false;
        }

        // Generate a unique reservation ID
        const reservationId = Date.now();

        // Get all users from localStorage
        const users = JSON.parse(
          localStorage.getItem("spaceVoyagerUsers") || "[]"
        );
        console.log("All users before update:", users);

        // Find the current user in the users array and add the reservation
        let userUpdated = false;
        const updatedUsers = users.map((user) => {
          if (user.id === currentUser.id) {
            if (!user.reservations) {
              user.reservations = [];
            }
            user.reservations.push(reservationId);
            userUpdated = true;
            console.log("Updated user reservations:", user.reservations);

            // Update current user in localStorage
            localStorage.setItem("currentUser", JSON.stringify(user));
          }
          return user;
        });

        if (!userUpdated) {
          console.error("Current user not found in users array");
          return false;
        }

        // Save updated users back to localStorage
        localStorage.setItem("spaceVoyagerUsers", JSON.stringify(updatedUsers));
        console.log("Users saved to localStorage with new reservation");

        // Verify the save worked
        const verifyUsers = JSON.parse(
          localStorage.getItem("spaceVoyagerUsers") || "[]"
        );
        const verifyUser = verifyUsers.find((u) => u.id === currentUser.id);
        console.log(
          "Verification - user reservations:",
          verifyUser?.reservations
        );

        // Save booking details with reservation ID
        const bookingWithId = {
          ...bookingData,
          reservationId: reservationId,
          userId: currentUser.id,
          bookingDate: new Date().toISOString(),
        };

        // Save booking to separate bookings storage
        const existingBookings = JSON.parse(
          localStorage.getItem("spaceVoyagerBookings") || "[]"
        );
        existingBookings.push(bookingWithId);
        localStorage.setItem(
          "spaceVoyagerBookings",
          JSON.stringify(existingBookings)
        );

        return reservationId;
      }

      // Update navigation based on login status
      function updateNavigation() {
        const authLink = document.getElementById("auth-link");
        const mobileAuthLink = document.getElementById("mobile-auth-link");

        const currentUser = JSON.parse(
          localStorage.getItem("currentUser") || "null"
        );

        if (currentUser) {
          // User is logged in - show logout with user name
          const displayText = `Log Out (${currentUser.name})`;
          if (authLink) {
            authLink.innerHTML = displayText;
            authLink.onclick = handleLogout;
          }
          if (mobileAuthLink) {
            mobileAuthLink.innerHTML = displayText;
            mobileAuthLink.onclick = handleLogout;
          }
        } else {
          // User is not logged in - show login
          if (authLink) {
            authLink.innerHTML = "Login";
            authLink.onclick = null;
            authLink.href = "login.html";
          }
          if (mobileAuthLink) {
            mobileAuthLink.innerHTML = "Login";
            mobileAuthLink.onclick = null;
            mobileAuthLink.href = "login.html";
          }
        }
      }

      // Handle logout
      function handleLogout(e) {
        e.preventDefault();
        localStorage.removeItem("currentUser");
        localStorage.removeItem("pendingBooking");
        window.location.href = "login.html";
      }

      // Update form submission handler in your booking page
      document
        .getElementById("booking-form")
        .addEventListener("submit", function (e) {
          e.preventDefault();

          if (!validateForm()) {
            return;
          }

          // Check if user is logged in
          if (!isUserLoggedIn()) {
            // Save form data as pending booking
            const formData = {
              destination: document.getElementById("destination").value,
              departureDate: document.getElementById("departure-date").value,
              passengers: document.querySelector(
                'input[name="passengers"]:checked'
              ).value,
              accommodation: document.getElementById("accommodation").value,
              passengerForms: [],
            };

            // Save passenger form data
            const passengerForms = document.querySelectorAll(".passenger-form");
            passengerForms.forEach((form, index) => {
              const passengerData = {
                firstName: form.querySelector('input[name="first-name[]"]')
                  .value,
                lastName: form.querySelector('input[name="last-name[]"]').value,
                email: form.querySelector('input[name="email[]"]').value,
                phone: form.querySelector('input[name="phone[]"]').value,
                specialRequirements: form.querySelector(
                  'textarea[name="special-requirements[]"]'
                ).value,
              };
              formData.passengerForms.push(passengerData);
            });

            // Save pending booking to localStorage
            localStorage.setItem("pendingBooking", JSON.stringify(formData));

            // Redirect to login page
            window.location.href = "login.html";
            return;
          }

          // User is logged in, proceed with booking
          const formData = {
            destination: document.getElementById("destination").value,
            departureDate: document.getElementById("departure-date").value,
            passengers: document.querySelector(
              'input[name="passengers"]:checked'
            ).value,
            accommodation: document.getElementById("accommodation").value,
            passengerForms: [],
          };

          // Save passenger form data
          const passengerForms = document.querySelectorAll(".passenger-form");
          passengerForms.forEach((form, index) => {
            const passengerData = {
              firstName: form.querySelector('input[name="first-name[]"]').value,
              lastName: form.querySelector('input[name="last-name[]"]').value,
              email: form.querySelector('input[name="email[]"]').value,
              phone: form.querySelector('input[name="phone[]"]').value,
              specialRequirements: form.querySelector(
                'textarea[name="special-requirements[]"]'
              ).value,
            };
            formData.passengerForms.push(passengerData);
          });

          // Save booking to user's account
          const reservationId = saveBookingToUser(formData);

          if (reservationId) {
            // Clear saved form data and pending booking
            clearFormData();
            localStorage.removeItem("pendingBooking");

            alert(
              `Thank you for your booking! Your reservation ID is: ${reservationId}. We will contact you shortly to confirm your space journey.`
            );

            // Optionally redirect to a confirmation page
            // window.location.href = 'confirmation.html';
          } else {
            alert(
              "There was an error processing your booking. Please try again."
            );
          }
        });

      // Add this function to check for pending booking when page loads
      function checkPendingBooking() {
        const pendingBooking = localStorage.getItem("pendingBooking");
        const currentUser = getCurrentUser();

        if (pendingBooking && currentUser) {
          // User just logged in with a pending booking
          const bookingData = JSON.parse(pendingBooking);

          // Auto-fill the form with pending booking data
          document.getElementById("destination").value =
            bookingData.destination;
          document.getElementById("departure-date").value =
            bookingData.departureDate;

          // Trigger change event to load accommodations
          document
            .getElementById("destination")
            .dispatchEvent(new Event("change"));

          // Set passenger type
          const passengerRadio = document.querySelector(
            `input[name="passengers"][value="${bookingData.passengers}"]`
          );
          if (passengerRadio) {
            passengerRadio.checked = true;
            updateMaxPassengers();
          }

          // Restore passenger forms after a delay
          setTimeout(() => {
            if (bookingData.accommodation) {
              document.getElementById("accommodation").value =
                bookingData.accommodation;
              const accommodationCard = document.querySelector(
                `.accommodation-card[data-type="${bookingData.accommodation}"]`
              );
              if (accommodationCard) {
                document
                  .querySelectorAll(".accommodation-card")
                  .forEach((card) => card.classList.remove("selected"));
                accommodationCard.classList.add("selected");
              }
            }

            // Restore passenger forms
            if (
              bookingData.passengerForms &&
              bookingData.passengerForms.length > 0
            ) {
              // Remove all passenger forms except the primary one
              const passengerForms =
                document.querySelectorAll(".passenger-form");
              for (let i = passengerForms.length - 1; i > 0; i--) {
                passengerForms[i].remove();
              }

              // Restore primary passenger data
              const primaryPassenger = bookingData.passengerForms[0];
              if (primaryPassenger) {
                const primaryForm = document.getElementById("passenger-form-0");
                primaryForm.querySelector('input[name="first-name[]"]').value =
                  primaryPassenger.firstName || "";
                primaryForm.querySelector('input[name="last-name[]"]').value =
                  primaryPassenger.lastName || "";
                primaryForm.querySelector('input[name="email[]"]').value =
                  primaryPassenger.email || "";
                primaryForm.querySelector('input[name="phone[]"]').value =
                  primaryPassenger.phone || "";
                primaryForm.querySelector(
                  'textarea[name="special-requirements[]"]'
                ).value = primaryPassenger.specialRequirements || "";
              }

              // Add and restore additional passenger forms
              for (let i = 1; i < bookingData.passengerForms.length; i++) {
                if (i < maxPassengers) {
                  addPassengerForm();
                  const passengerData = bookingData.passengerForms[i];
                  const passengerForm = document.getElementById(
                    `passenger-form-${i + 1}`
                  );

                  if (passengerForm && passengerData) {
                    passengerForm.querySelector(
                      'input[name="first-name[]"]'
                    ).value = passengerData.firstName || "";
                    passengerForm.querySelector(
                      'input[name="last-name[]"]'
                    ).value = passengerData.lastName || "";
                    passengerForm.querySelector('input[name="email[]"]').value =
                      passengerData.email || "";
                    passengerForm.querySelector('input[name="phone[]"]').value =
                      passengerData.phone || "";
                    passengerForm.querySelector(
                      'textarea[name="special-requirements[]"]'
                    ).value = passengerData.specialRequirements || "";
                  }
                }
              }
            }
          }, 1000);

          // Show notification about pending booking
          showPendingBookingNotification();
        }
      }

      // Function to show pending booking notification
      function showPendingBookingNotification() {
        const notification = document.createElement("div");
        notification.className =
          "fixed top-4 right-4 bg-neon-blue text-white px-6 py-3 rounded-lg shadow-lg z-50";
        notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-info-circle mr-2"></i>
            <span>We found your pending booking. Your form has been auto-filled.</span>
        </div>
    `;
        document.body.appendChild(notification);

        // Remove notification after 5 seconds
        setTimeout(() => {
          notification.remove();
        }, 5000);
      }

      // Update your existing DOMContentLoaded event listener in booking page
      document.addEventListener("DOMContentLoaded", async function () {
        createStars();
        updateNavigation(); // Add this line

        // Setup passenger selection change
        const passengerRadios = document.querySelectorAll(
          'input[name="passengers"]'
        );
        passengerRadios.forEach((radio) => {
          radio.addEventListener("change", function () {
            updateMaxPassengers();
            saveFormData();
          });
        });

        // Initialize max passengers
        updateMaxPassengers();

        // Setup input validation
        setupInputValidation();

        // Load both accommodations and destinations
        await loadAccommodations();
        await loadDestinations();

        // Setup auto-save and restore form data
        setupAutoSave();
        restoreFormData();

        // Check for pending booking
        checkPendingBooking();
      });
