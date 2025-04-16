import { PlannedEvent } from './types/event';

// Interfaces
export interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
}

export interface EventFormData {
    name: string;
    date: string;
    time: string;
    location: string;
    category: string;
    description: string;
    organizerId: string;
    organizerName: string;
}

// API Utilities
export async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return {
            data,
            status: response.status,
            message: 'Success'
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
    }
}

// Form Validation
export function validateForm(formData: FormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const required = ['name', 'date', 'time', 'location', 'category', 'description'];

    required.forEach(field => {
        const value = formData.get(field);
        if (!value || value.toString().trim() === '') {
            errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        }
    });

    // Date validation
    const dateValue = formData.get('date')?.toString();
    if (dateValue) {
        const selectedDate = new Date(dateValue);
        const today = new Date();
        if (selectedDate < today) {
            errors.push('Date cannot be in the past');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

// Utility Functions
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Modal Handlers
export async function showSignUpModal(id: number): Promise<void> {
    try {
        const response = await fetchData<PlannedEvent[]>('/opportunities.json');
        const opportunity = response.data.find(op => op.id === id);
        
        if (!opportunity) {
            throw new Error('Opportunity not found');
        }

        const modalTitle = document.getElementById("modalTitle");
        const modal = document.getElementById("signUpModal");
        
        if (!modalTitle || !modal) {
            throw new Error('Modal elements not found');
        }

        modalTitle.textContent = `Sign Up for ${opportunity.name}`;
        const bootstrapModal = new (window as any).bootstrap.Modal(modal);
        bootstrapModal.show();

    } catch (error) {
        console.error('Error showing modal:', error);
        alert('Failed to load opportunity details. Please try again.');
    }
}

// Event Handlers
export function loadPlannedEvents(container: HTMLElement): void {
    try {
        const events = JSON.parse(localStorage.getItem("plannedEvents") || "[]") as PlannedEvent[];
        container.innerHTML = '';

        if (events.length === 0) {
            container.innerHTML = '<p class="text-center">No planned events yet.</p>';
            return;
        }

        events.forEach((event: PlannedEvent) => {
            const eventCard = document.createElement("div");
            eventCard.className = "col-md-6 col-lg-4 mb-4";
            eventCard.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${escapeHtml(event.name)}</h5>
                        <p class="card-text">
                            <strong>Date:</strong> ${formatDate(event.date)}<br>
                            <strong>Time:</strong> ${event.time}<br>
                            <strong>Location:</strong> ${escapeHtml(event.location)}<br>
                            <strong>Category:</strong> ${escapeHtml(event.category)}
                        </p>
                        <p class="card-text">${escapeHtml(event.description)}</p>
                        <p class="card-text"><small class="text-muted">Organized by: ${escapeHtml(event.organizerName)}</small></p>
                    </div>
                </div>
            `;
            container.appendChild(eventCard);
        });
    } catch (error) {
        console.error('Error loading planned events:', error);
        container.innerHTML = '<p class="text-center text-danger">Error loading events. Please try again.</p>';
    }
}

export async function handleEventFormSubmission(
    e: Event, 
    user: string, 
    form: HTMLFormElement
): Promise<void> {
    e.preventDefault();

    try {
        const formData = new FormData(form);
        const validation = validateForm(formData);

        if (!validation.isValid) {
            alert(validation.errors.join('\n'));
            return;
        }

        const userData = JSON.parse(user);
        const eventData: PlannedEvent = {
            id: Date.now(),
            name: formData.get('eventName') as string,
            date: formData.get('eventDate') as string,
            time: formData.get('eventTime') as string,
            location: formData.get('eventLocation') as string,
            category: formData.get('eventCategory') as string,
            description: formData.get('eventDescription') as string,
            organizerId: userData.email,
            organizerName: userData.name,
            createdAt: new Date().toISOString()
        };

        // Get existing events
        const events = JSON.parse(localStorage.getItem("plannedEvents") || "[]");
        events.push(eventData);
        localStorage.setItem("plannedEvents", JSON.stringify(events));

        // Reset form and show success message
        form.reset();
        alert('Event created successfully!');

        // Refresh events display
        const container = document.getElementById('plannedEventsContainer');
        if (container) {
            loadPlannedEvents(container);
        }

    } catch (error) {
        console.error('Error submitting event:', error);
        alert('Failed to create event. Please try again.');
    }
}

// Helper Functions
function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}