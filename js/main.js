"use strict";

/**
 * Author: Jaskirat Singh Bhogal
 * Student ID: 100935716
 * Date of Completion: 2025-02-25
 */

// Add this utility function at the top of the file
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// IIFE - Immediately Invoked Functional Expression
(function () {
    /**
     * Display the Home Page content.
     */
    function DisplayHomePage() {
        console.log("Calling DisplayHomePage...");

        const getInvolvedButton = document.getElementById("getInvolvedBtn");
        getInvolvedButton.addEventListener("click", function () {
            location.href = "opportunities.html";
        });
    }

    /**
     * Display the Opportunities Page content.
     */
    function DisplayOpportunitiesPage() {
        console.log("Calling DisplayOpportunitiesPage...");

        const opportunitiesContainer = document.getElementById("opportunitiesContainer");
        
        // Fetch opportunities data
        fetch('/opportunities.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(opportunities => {
                opportunities.forEach((opportunity) => {
                    const card = document.createElement("div");
                    card.className = "card mb-3";
                    card.innerHTML = `
                        <div class="card-body">
                            <h5 class="card-title">${opportunity.title}</h5>
                            <p class="card-text">${opportunity.description}</p>
                            <p class="card-text"><strong>Date:</strong> ${opportunity.date}</p>
                            <p class="card-text"><strong>Time:</strong> ${opportunity.time}</p>
                            <p class="card-text"><strong>Location:</strong> ${opportunity.location}</p>
                            <button class="btn btn-primary signUpBtn" data-id="${opportunity.id}">Sign Up</button>
                        </div>
                    `;
                    opportunitiesContainer.appendChild(card);
                });

                // Add event listeners to sign up buttons
                const signUpButtons = document.querySelectorAll(".signUpBtn");
                signUpButtons.forEach((button) => {
                    button.addEventListener("click", function (e) {
                        const id = e.target.getAttribute("data-id");
                        showSignUpModal(id);
                    });
                });
            })
            .catch(error => {
                console.error('Error loading opportunities:', error);
                opportunitiesContainer.innerHTML = '<p>Error loading opportunities. Please try again later.</p>';
            });
    }

    /**
     * Display the Events Page content.
     */
    function DisplayEventsPage() {
        console.log("Displaying Events Page...");

        const eventsContainer = document.getElementById("eventsContainer");
        const categoryFilter = document.getElementById("categoryFilter");
        const locationFilter = document.getElementById("locationFilter");
        const dateFilter = document.getElementById("dateFilter");

        /**
         * Render the filtered events.
         * @param {Array} filteredEvents - The filtered events to render.
         */
        function renderEvents(filteredEvents) {
            eventsContainer.innerHTML = '';
            filteredEvents.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'col-md-4 mb-4';
                eventElement.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${event.title}</h5>
                            <p class="card-text"><strong>Date:</strong> ${event.date}</p>
                            <p class="card-text"><strong>Time:</strong> ${event.time}</p>
                            <p class="card-text"><strong>Category:</strong> ${event.category}</p>
                            <p class="card-text"><strong>Location:</strong> ${event.location}</p>
                            <p class="card-text">${event.description}</p>
                        </div>
                    </div>
                `;
                eventsContainer.appendChild(eventElement);
            });
        }

        /**
         * Filter the events based on selected filters.
         * @param {Array} events - The events to filter.
         */
        function filterEvents(events) {
            const category = categoryFilter.value;
            const location = locationFilter.value;
            const date = dateFilter.value;

            const filteredEvents = events.filter(event => {
                return (category === 'all' || event.category === category) &&
                       (location === 'all' || event.location === location) &&
                       (!date || event.date === date);
            });

            renderEvents(filteredEvents);
        }

        // Fetch events data from JSON file
        fetch('/events.json')
            .then(response => response.json())
            .then(data => {
                // Initial render
                renderEvents(data);

                // Add event listeners for filters
                categoryFilter.addEventListener('change', () => filterEvents(data));
                locationFilter.addEventListener('change', () => filterEvents(data));
                dateFilter.addEventListener('change', () => filterEvents(data));
            })
            .catch(error => console.error('Error fetching events data:', error));
    }

    /**
     * Display the Gallery Page content.
     */
    function DisplayGalleryPage() {
        console.log("Displaying Gallery Page...");

        const galleryContainer = document.getElementById("galleryContainer");

        // Fetch image data from gallery.json
        fetch('/gallery.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(images => {
                // Clear existing content
                galleryContainer.innerHTML = '';

                // Populate gallery with images
                images.forEach(image => {
                    const col = document.createElement('div');
                    col.className = 'col-lg-3 col-md-4 col-6 mb-4';
                    col.innerHTML = `
                        <a href="${image.fullImage}" data-lightbox="event-gallery" data-title="${image.title}">
                            <img src="${image.thumbnail}" class="img-fluid" alt="${image.title}">
                        </a>
                    `;
                    galleryContainer.appendChild(col);
                });
            })
            .catch(error => {
                console.error('Error fetching gallery images:', error);
                galleryContainer.innerHTML = '<p>An error occurred while loading the gallery. Please try again later.</p>';
            });
    }

    /**
     * Fetch and display community news.
     */
    async function fetchCommunityNews() {
        const newsContainer = document.getElementById('newsContainer');
        // Only proceed if newsContainer exists
        if (!newsContainer) {
            console.log('News container not found on this page');
            return;
        }

        try {
            const response = await fetch('/api/news');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const news = await response.json();
            
            newsContainer.innerHTML = news.map(item => `
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${item.title}</h5>
                            <p class="card-text">${item.description}</p>
                            <a href="${item.link}" class="btn btn-primary" target="_blank">Read More</a>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error fetching news:', error);
            if (newsContainer) {
                newsContainer.innerHTML = '<p class="text-danger">Error loading news. Please try again later.</p>';
            }
        }
    }

    // Call the function when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', fetchCommunityNews);

    /**
     * Display the Contact Page content.
     */
    function DisplayContactPage() {
        console.log("Calling DisplayContactPage...");

        // Form submission event handler
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault(); // Stop form from submitting

            // Collect input values
            const name = nameInput.value;
            const email = emailInput.value;
            const subject = subjectInput.value;
            const message = messageInput.value;

            // Validate inputs
            if (!name || !email || !subject || !message) {
                alert("Please fill out all the fields.");
                return;
            }
            if (!validateEmail(email)) {
                alert("Invalid email address. Please enter a valid email.");
                return;
            }

            // If all validations pass, show confirmation modal
            showConfirmationModal();
        });

        /**
         * Show the confirmation modal.
         */
        function showConfirmationModal() {
            const modalHtml = `
                <div class="modal fade" id="confirmationModal" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="confirmationModalLabel">Thank You!</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p>Your message has been submitted successfully. Redirecting to the Home Page in 5 seconds...</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Append modal to the body
            const modalContainer = document.createElement("div");
            modalContainer.innerHTML = modalHtml;
            document.body.appendChild(modalContainer);

            // Show modal
            const confirmationModal = new bootstrap.Modal(document.getElementById("confirmationModal"));
            confirmationModal.show();

            // Redirect to Home Page after 5 seconds
            setTimeout(() => {
                confirmationModal.hide();
                window.location.href = "index.html";
            }, 5000);
        }
    }

    /**
     * Display the Statistics Page content.
     */
    function DisplayStatisticsPage() {
        console.log("Displaying Statistics Page...");

        // Check if user is authenticated
        const user = localStorage.getItem("user");
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        // Fetch statistics data
        fetch('/statistics.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Create Monthly Sign-ups Chart
                new Chart(document.getElementById('signupsChart'), {
                    type: 'line',
                    data: {
                        labels: data.monthlySignups.labels,
                        datasets: [{
                            label: 'Monthly Sign-ups',
                            data: data.monthlySignups.data,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        }]
                    }
                });

                // Create Categories Chart
                new Chart(document.getElementById('categoryChart'), {
                    type: 'pie',
                    data: {
                        labels: data.categories.labels,
                        datasets: [{
                            data: data.categories.data,
                            backgroundColor: [
                                'rgb(255, 99, 132)',
                                'rgb(54, 162, 235)',
                                'rgb(255, 206, 86)',
                                'rgb(75, 192, 192)',
                                'rgb(153, 102, 255)'
                            ]
                        }]
                    }
                });

                // Create Volunteer Hours Chart
                new Chart(document.getElementById('hoursChart'), {
                    type: 'bar',
                    data: {
                        labels: data.volunteerHours.labels,
                        datasets: [{
                            label: 'Volunteer Hours',
                            data: data.volunteerHours.data,
                            backgroundColor: 'rgb(54, 162, 235)'
                        }]
                    }
                });

                // Create Impact Chart
                new Chart(document.getElementById('impactChart'), {
                    type: 'radar',
                    data: {
                        labels: data.impact.labels,
                        datasets: [{
                            label: 'Impact Metrics',
                            data: data.impact.data,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgb(75, 192, 192)',
                            pointBackgroundColor: 'rgb(75, 192, 192)'
                        }]
                    }
                });
            })
            .catch(error => {
                console.error('Error loading statistics:', error);
                const containers = ['signupsChart', 'categoryChart', 'hoursChart', 'impactChart'];
                containers.forEach(id => {
                    const container = document.getElementById(id);
                    if (container) {
                        container.parentElement.innerHTML = '<p class="text-danger">Error loading chart data.</p>';
                    }
                });
            });
    }

    /**
     * Display the Event Planning Page content.
     */
    function DisplayEventPlanningPage() {
        console.log("Displaying Event Planning Page...");

        // Check if user is authenticated
        const user = localStorage.getItem("user");
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        const eventPlanningForm = document.getElementById("eventPlanningForm");
        const plannedEventsContainer = document.getElementById("plannedEventsContainer");

        // Load existing planned events
        loadPlannedEvents();

        // Handle form submission
        eventPlanningForm?.addEventListener("submit", function (e) {
            e.preventDefault();

            const formData = {
                name: document.getElementById("eventName").value,
                date: document.getElementById("eventDate").value,
                time: document.getElementById("eventTime").value,
                location: document.getElementById("eventLocation").value,
                category: document.getElementById("eventCategory").value,
                description: document.getElementById("eventDescription").value,
                organizerId: JSON.parse(user).email,
                organizerName: JSON.parse(user).name,
                createdAt: new Date().toISOString()
            };

            // Validate form data
            const validation = EventValidator.validateEvent(formData);
            if (!validation.isValid) {
                alert(validation.errors.join("\n"));
                return;
            }

            // Save event
            saveEvent(formData);
        });

        function saveEvent(eventData) {
            // Get existing events
            let events = JSON.parse(localStorage.getItem("plannedEvents") || "[]");

            // Add new event with ID
            const newEvent = {
                ...eventData,
                id: Date.now()
            };
            events.push(newEvent);

            // Save to localStorage
            localStorage.setItem("plannedEvents", JSON.stringify(events));

            // Refresh events display
            loadPlannedEvents();
            
            // Reset form
            eventPlanningForm.reset();
        }

        function loadPlannedEvents() {
            if (!plannedEventsContainer) return;

            const events = JSON.parse(localStorage.getItem("plannedEvents") || "[]");
            plannedEventsContainer.innerHTML = '';

            events.forEach(event => {
                const eventCard = document.createElement("div");
                eventCard.className = "col-md-6 col-lg-4";
                eventCard.innerHTML = `
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${event.name}</h5>
                            <p class="card-text">
                                <strong>Date:</strong> ${event.date}<br>
                                <strong>Time:</strong> ${event.time}<br>
                                <strong>Location:</strong> ${event.location}<br>
                                <strong>Category:</strong> ${event.category}
                            </p>
                            <p class="card-text">${event.description}</p>
                            <p class="card-text"><small class="text-muted">Organized by: ${event.organizerName}</small></p>
                        </div>
                    </div>
                `;
                plannedEventsContainer.appendChild(eventCard);
            });
        }
    }

    /**
     * Dynamically update the navbar.
     */
    function dynamicNavbar() {
        const navbar = document.querySelector('.navbar-nav');
        if (navbar) {
            const opportunitiesLink = navbar.querySelector('a[href="opportunities.html"]');
            if (opportunitiesLink) {
                opportunitiesLink.textContent = "Volunteer Now";
            }

            // Add Donate link
            const donateLink = document.createElement('li');
            donateLink.className = 'nav-item';
            donateLink.innerHTML = `
                <a class="nav-link" href="donate.html">Donate</a>
            `;
            navbar.appendChild(donateLink);
        }
    }

    /**
     * Add statistics and event planning links to navbar for authenticated users.
     */
    function updateNavbar() {
        const navbar = document.querySelector('.navbar-nav');
        const user = localStorage.getItem("user");

        if (user && navbar) {
            // Add Event Planning link
            if (!navbar.querySelector('a[href="event-planning.html"]')) {
                const eventPlanningLink = document.createElement('li');
                eventPlanningLink.className = 'nav-item';
                eventPlanningLink.innerHTML = `
                    <a class="nav-link" href="event-planning.html">
                        <i class="fas fa-calendar-plus"></i> Event Planning
                    </a>
                `;
                navbar.appendChild(eventPlanningLink);
            }
        
            // Add Statistics link
            if (!navbar.querySelector('a[href="statistics.html"]')) {
                const statsLink = document.createElement('li');
                statsLink.className = 'nav-item';
                statsLink.innerHTML = `
                    <a class="nav-link" href="statistics.html">
                        <i class="fas fa-chart-bar"></i> Statistics
                    </a>
                `;
                navbar.appendChild(statsLink);
            }
        }
    }

    /**
     * Handle the Back to Top button functionality.
     */
    function HandleBackToTop() {
        console.log("Initializing Back to Top functionality...");

        // Select the button
        const backToTopButton = document.getElementById("backToTop");
        if (!backToTopButton) {
            console.error("Back to Top button not found in the DOM!");
            return;
        }

        // Scroll event to show or hide the button.
        window.addEventListener("scroll", function () {
            if (window.scrollY > 300) {
                console.log("Scroll position > 300. Showing Back to Top button.");
                backToTopButton.style.display = "block";
            } else {
                console.log("Scroll position <= 300. Hiding Back to Top button.");
                backToTopButton.style.display = "none";
            }
        });

        // Click event for smooth scrolling to the top
        backToTopButton.addEventListener("click", function () {
            console.log("Back to Top button clicked. Scrolling to the top.");
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    /**
     * Handle the search functionality.
     */
    function handleSearch() {
        const searchForm = document.getElementById("searchForm");
        const searchInput = document.getElementById("searchInput");
        const searchResults = document.getElementById("searchResults");

        if (!searchForm || !searchInput || !searchResults) {
            console.error("Search form, input, or results container not found in the DOM!");
            return;
        }

        searchForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const query = searchInput.value.toLowerCase();
            searchResults.innerHTML = '';

            // Filter and display volunteer opportunities
            const filteredOpportunities = volunteerOpportunities.filter(opportunity => 
                opportunity.title.toLowerCase().includes(query) || 
                opportunity.description.toLowerCase().includes(query)
            );
            if (filteredOpportunities.length > 0) {
                filteredOpportunities.forEach(opportunity => {
                    const resultItem = document.createElement("div");
                    resultItem.className = "card mb-3";
                    resultItem.innerHTML = `
                        <div class="card-body">
                            <h5 class="card-title">${opportunity.title}</h5>
                            <p class="card-text">${opportunity.description}</p>
                            <p class="card-text"><strong>Date:</strong> ${opportunity.date}</p>
                            <p class="card-text"><strong>Time:</strong> ${opportunity.time}</p>
                            <p class="card-text"><strong>Location:</strong> ${opportunity.location}</p>
                        </div>
                    `;
                    searchResults.appendChild(resultItem);
                });
            }

            // Fetch and filter events data
            fetch('/events.json')
                .then(response => response.json())
                .then(events => {
                    const filteredEvents = events.filter(event => 
                        event.title.toLowerCase().includes(query) || 
                        event.description.toLowerCase().includes(query)
                    );
                    if (filteredEvents.length > 0) {
                        filteredEvents.forEach(event => {
                            const resultItem = document.createElement("div");
                            resultItem.className = "card mb-3";
                            resultItem.innerHTML = `
                                <div class="card-body">
                                    <h5 class="card-title">${event.title}</h5>
                                    <p class="card-text">${event.description}</p>
                                    <p class="card-text"><strong>Date:</strong> ${event.date}</p>
                                    <p class="card-text"><strong>Time:</strong> ${event.time}</p>
                                    <p class="card-text"><strong>Location:</strong> ${event.location}</p>
                                </div>
                            `;
                            searchResults.appendChild(resultItem);
                        });
                    }
                })
                .catch(error => console.error('Error fetching events data:', error));

            // Fetch and filter news data
            const apiKey = 'pub_7189806c0121d2ef09fe10317d8f68d125e6c';
            const apiUrl = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${query}&country=ca`;
            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.results && data.results.length > 0) {
                        data.results.forEach(article => {
                            const resultItem = document.createElement("div");
                            resultItem.className = "card mb-3";
                            resultItem.innerHTML = `
                                <div class="card-body">
                                    <h5 class="card-title">${article.title}</h5>
                                    <p class="card-text">${article.description || 'No description available.'}</p>
                                    <a href="${article.link}" class="btn btn-primary" target="_blank">Read More</a>
                                </div>
                            `;
                            searchResults.appendChild(resultItem);
                        });
                    }
                })
                .catch(error => console.error('Error fetching news data:', error));
        });
    }

    /**
     * Handle user authentication and session management.
     */
    function handleUserAuthentication() {
        const welcomeMessage = document.getElementById("welcomeMessage");
        const loginLink = document.getElementById("loginLink");
        const logoutLink = document.getElementById("logoutLink");
        const userDropdown = document.createElement("li");
        userDropdown.className = "nav-item dropdown";

        // Check if user is logged in
        const user = localStorage.getItem("user");
        if (user) {
            const userData = JSON.parse(user);

            // Create user dropdown menu
            userDropdown.innerHTML = `
                <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" 
                   data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-user"></i> Welcome, ${userData.name}
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item" href="profile.html">
                        <i class="fas fa-user-circle"></i> Profile
                    </a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" id="logoutButton">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a></li>
                </ul>
            `;

            // Hide login link and show user dropdown
            if (loginLink) loginLink.style.display = "none";
            if (welcomeMessage) welcomeMessage.parentNode.replaceWith(userDropdown);

            // Add logout functionality
            const logoutButton = userDropdown.querySelector("#logoutButton");
            logoutButton.addEventListener("click", handleLogout);
        } else {
            // Show login link and hide user dropdown
            if (loginLink) loginLink.style.display = "block";
            if (userDropdown.parentNode) userDropdown.parentNode.removeChild(userDropdown);
        }
    }

    /**
     * Handle user logout.
     */
    function handleLogout() {
        // Show confirmation dialog
        if (confirm("Are you sure you want to logout?")) {
            // Clear user data
            localStorage.removeItem("user");
            localStorage.removeItem("plannedEvents");
            sessionStorage.clear();

            // Show success message
            const toast = createToast("Logged out successfully!", "success");
            document.body.appendChild(toast);
            new bootstrap.Toast(toast).show();

            // Redirect to home page after brief delay
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        }
    }

    /**
     * Handle the login form submission.
     */
    function handleLogin() {
        const loginForm = document.getElementById("loginForm");
        if (!loginForm) return;

        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();

            // Basic validation
            if (!name || !email) {
                createToast("Please fill in all fields", "error");
                return;
            }
            if (!isValidEmail(email)) {
                createToast("Please enter a valid email address", "error");
                return;
            }

            // Create user object with timestamp
            const user = {
                name,
                email,
                loginTime: new Date().toISOString(),
                lastActive: new Date().toISOString()
            };

            // Save user data
            localStorage.setItem("user", JSON.stringify(user));

            // Show success message
            const toast = createToast("Login successful! Welcome " + name, "success");
            document.body.appendChild(toast);
            new bootstrap.Toast(toast).show();

            // Redirect to home page after brief delay
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        });
    }

    /**
     * Create a Bootstrap toast notification.
     */
    function createToast(message, type = "info") {
        const toast = document.createElement("div");
        toast.className = `toast align-items-center text-white bg-${type === "error" ? "danger" : "success"}`;
        toast.setAttribute("role", "alert");
        toast.setAttribute("aria-live", "assertive");
        toast.setAttribute("aria-atomic", "true");
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                        data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        return toast;
    }

    /**
     * Validate email format.
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Update user's last active timestamp.
     */
    function updateUserActivity() {
        const user = localStorage.getItem("user");
        if (user) {
            const userData = JSON.parse(user);
            userData.lastActive = new Date().toISOString();
            localStorage.setItem("user", JSON.stringify(userData));
        }
    }

    // Add activity tracking
    document.addEventListener("mousemove", debounce(updateUserActivity, 1000));
    document.addEventListener("keypress", debounce(updateUserActivity, 1000));

    /**
     * Highlight the active page in the navbar.
     */
    function highlightActivePage() {
        const navLinks = document.querySelectorAll('.nav-link');
        const currentPage = window.location.pathname.split('/').pop();

        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Start the application based on the current page title.
     */
    function Start() {
        console.log("Starting App...");

        switch (document.title) {
            case "Home":
                DisplayHomePage();
                break;
            case "Opportunities":
                DisplayOpportunitiesPage();
                break;
            case "Events":
                DisplayEventsPage();
                break;
            case "Gallery":
                DisplayGalleryPage();
                break;
            case "About":
                DisplayAboutPage();
                break;
            case "Contact":
                DisplayContactPage();
                break;
            case "Statistics":
                DisplayStatisticsPage();
                break;
            case "Event Planning":
                DisplayEventPlanningPage();
                break;
        }
    }

    window.addEventListener("load", Start);
    window.addEventListener("DOMContentLoaded", function () {
        HandleBackToTop();
        dynamicNavbar();
        handleSearch();
        handleUserAuthentication();
        handleLogin();
        highlightActivePage();
        updateNavbar();
    });
})();