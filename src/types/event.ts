export interface PlannedEvent {
    id: number;
    name: string;
    date: string;
    time: string;
    location: string;
    category: string;
    description: string;
    organizerId: string;
    organizerName: string;
    createdAt: string;
}

export class EventValidator {
    static validateEvent(event: Partial<PlannedEvent>): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!event.name || event.name.trim().length < 3) {
            errors.push("Event name must be at least 3 characters long");
        }

        if (!event.date) {
            errors.push("Event date is required");
        } else {
            const eventDate = new Date(event.date);
            const today = new Date();
            if (eventDate < today) {
                errors.push("Event date cannot be in the past");
            }
        }

        if (!event.time) {
            errors.push("Event time is required");
        }

        if (!event.location || event.location.trim().length < 5) {
            errors.push("Location must be at least 5 characters long");
        }

        if (!event.category) {
            errors.push("Category is required");
        }

        if (!event.description || event.description.trim().length < 20) {
            errors.push("Description must be at least 20 characters long");
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}