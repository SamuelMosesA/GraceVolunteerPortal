import { fireStore } from './connection';
import { doc, getDoc } from 'firebase/firestore';
import type { UserSchedule, Shift } from '../types';

export async function getUserSchedule(email: string): Promise<UserSchedule | null> {
    try {
        const docRef = doc(fireStore, 'user_schedules', email);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as UserSchedule;
        } else {
            console.log('No such document!');
            return null;
        }
    } catch (error) {
        console.error('Error getting user schedule:', error);
        return null;
    }
}

export function getNearestShift(shifts: Shift[]): Shift | null {
    if (!shifts || shifts.length === 0) return null;

    const now = new Date();
    // Normalize now to start of day for comparison if needed, 
    // but the instruction says "earliest >= current date"

    const upcomingShifts = shifts
        .filter((shift) => new Date(shift.date) >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return upcomingShifts.length > 0 ? upcomingShifts[0] : null;
}
