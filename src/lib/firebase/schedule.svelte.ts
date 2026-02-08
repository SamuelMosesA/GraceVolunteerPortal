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
    now.setHours(0, 0, 0, 0); // Normalize to start of day

    const upcomingShifts = shifts
        .filter((shift) => {
            const shiftDate = new Date(shift.date);
            shiftDate.setHours(0, 0, 0, 0); // Normalize shift date too just in case
            return shiftDate >= now;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return upcomingShifts.length > 0 ? upcomingShifts[0] : null;
}
