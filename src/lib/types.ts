import type { Unsubscribe, User } from "firebase/auth";

export interface NavBarLinks {
    url: string,
    displayLabel: string
}

export interface OnAuthStateChangedResult {
    user: User | null,
    unsubscrbeAuthUpdates: Unsubscribe
}

export interface AuthState {
    user: User | null
}

export interface Shift {
    date: string;
    role: string;
    team: string;
}

export interface UserSchedule {
    email: string;
    lastUpdated: any; // Firestore Timestamp
    shifts: Shift[];
}