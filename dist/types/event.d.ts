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
export declare class EventValidator {
    static validateEvent(event: Partial<PlannedEvent>): {
        isValid: boolean;
        errors: string[];
    };
}
