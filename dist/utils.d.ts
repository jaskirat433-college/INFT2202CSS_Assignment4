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
export declare function fetchData<T>(url: string): Promise<ApiResponse<T>>;
export declare function validateForm(formData: FormData): {
    isValid: boolean;
    errors: string[];
};
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
export declare function showSignUpModal(id: number): Promise<void>;
export declare function loadPlannedEvents(container: HTMLElement): void;
export declare function handleEventFormSubmission(e: Event, user: string, form: HTMLFormElement): Promise<void>;
