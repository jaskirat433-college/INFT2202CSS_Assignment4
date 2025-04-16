import { PlannedEvent, EventValidator } from './types/event';

interface User {
    name: string;
    email: string;
    loginTime: string;
    lastActive: string;
}

interface ChartData {
    labels: string[];
    data: number[];
}

interface Statistics {
    monthlySignups: ChartData;
    categories: ChartData;
    volunteerHours: ChartData;
    impact: ChartData;
}

// IIFE with type annotations
(() => {
    function displayHomePage(): void {
        console.log("Calling DisplayHomePage...");

        const getInvolvedButton = document.getElementById("getInvolvedBtn");
        getInvolvedButton?.addEventListener("click", () => {
            location.href = "opportunities.html";
        });
    }

    function displayOpportunitiesPage(): void {
        console.log("Calling DisplayOpportunitiesPage...");

        const opportunitiesContainer = document.getElementById("opportunitiesContainer");
        if (!opportunitiesContainer) return;

        fetch('/opportunities.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(opportunities => {
                opportunities.forEach((opportunity: PlannedEvent) => {
                    const card = document.createElement("div");
                    card.className = "card mb-3";
                    card.innerHTML = `
                        <div class="card-body">
                            <h5 class="card-title">${opportunity.name}</h5>
                            <p class="card-text">${opportunity.description}</p>
                            <p class="card-text"><strong>Date:</strong> ${opportunity.date}</p>
                            <p class="card-text"><strong>Time:</strong> ${opportunity.time}</p>
                            <p class="card-text"><strong>Location:</strong> ${opportunity.location}</p>
                            <button class="btn btn-primary signUpBtn" data-id="${opportunity.id}">Sign Up</button>
                        </div>
                    `;
                    opportunitiesContainer.appendChild(card);
                });

                const signUpButtons = document.querySelectorAll<HTMLButtonElement>(".signUpBtn");
                signUpButtons.forEach((button) => {
                    button.addEventListener("click", (e) => {
                        const id = (e.target as HTMLButtonElement).getAttribute("data-id");
                        if (id) showSignUpModal(parseInt(id));
                    });
                });
            })
            .catch(error => {
                console.error('Error loading opportunities:', error);
                opportunitiesContainer.innerHTML = '<p>Error loading opportunities. Please try again later.</p>';
            });
    }

    function displayStatisticsPage(): void {
        console.log("Displaying Statistics Page...");

        const user = localStorage.getItem("user");
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        fetch('/statistics.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data: Statistics) => {
                // Create charts using Chart.js
                createCharts(data);
            })
            .catch(error => {
                console.error('Error loading statistics:', error);
                handleChartError();
            });
    }

    function createCharts(data: Statistics): void {
        const charts = [
            {
                id: 'signupsChart',
                type: 'line',
                data: data.monthlySignups,
                options: { /* chart options */ }
            },
            {
                id: 'categoryChart',
                type: 'pie',
                data: data.categories,
                options: { /* chart options */ }
            },
            // Add other charts...
        ];

        charts.forEach(chart => {
            const ctx = document.getElementById(chart.id) as HTMLCanvasElement;
            if (ctx) {
                new Chart(ctx, {
                    type: chart.type,
                    data: {
                        labels: chart.data.labels,
                        datasets: [{
                            data: chart.data.data,
                            // Add other dataset properties
                        }]
                    },
                    options: chart.options
                });
            }
        });
    }

    function handleChartError(): void {
        const containers = ['signupsChart', 'categoryChart', 'hoursChart', 'impactChart'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.parentElement!.innerHTML = '<p class="text-danger">Error loading chart data.</p>';
            }
        });
    }

    function displayEventPlanningPage(): void {
        console.log("Displaying Event Planning Page...");

        const user = localStorage.getItem("user");
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        const eventPlanningForm = document.getElementById("eventPlanningForm") as HTMLFormElement;
        const plannedEventsContainer = document.getElementById("plannedEventsContainer");

        if (!eventPlanningForm || !plannedEventsContainer) return;

        loadPlannedEvents(plannedEventsContainer);

        eventPlanningForm.addEventListener("submit", (e) => {
            e.preventDefault();
            handleEventFormSubmission(e, user, eventPlanningForm);
        });
    }

    // Add more TypeScript functions...

    // Event Listeners
    window.addEventListener("load", Start);
    window.addEventListener("DOMContentLoaded", () => {
        HandleBackToTop();
        dynamicNavbar();
        handleSearch();
        handleUserAuthentication();
        handleLogin();
        highlightActivePage();
        updateNavbar();
    });
})();