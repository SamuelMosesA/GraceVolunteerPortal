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

export function getUpcomingShifts(shifts: Shift[]): Shift[] {
    if (!shifts) return [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return shifts
        .filter((shift) => {
            const shiftDate = new Date(shift.date);
            shiftDate.setHours(0, 0, 0, 0);
            return shiftDate >= now;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

import Papa from 'papaparse';

export function getNearestShift(shifts: Shift[]): Shift | null {
    const upcomingShifts = getUpcomingShifts(shifts);
    if (upcomingShifts.length === 0) return null;

    return upcomingShifts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
}

export async function getScheduleTimes(): Promise<Record<string, string>> {
    try {
        const response = await fetch('/schedule_times/schedule_time.csv');
        if (!response.ok) throw new Error('Failed to fetch times');

        const csvText = await response.text();
        const results = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header: string) => header.trim()
        });

        const timesMap: Record<string, string> = {};
        (results.data as any[]).forEach(row => {
            const team = row['Team']?.trim();
            const time = row['Time']?.trim();
            if (team && time) {
                timesMap[team] = time;
            }
        });

        return timesMap;
    } catch (error) {
        console.error('Error fetching schedule times:', error);
        return {};
    }
}
