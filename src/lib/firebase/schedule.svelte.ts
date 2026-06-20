import { fireStore } from './connection';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import type { UserSchedule, Shift, GlobalScheduleCard } from '../types';

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

export function getNearestShift(shifts: Shift[]): Shift | null {
	const upcomingShifts = getUpcomingShifts(shifts);
	if (upcomingShifts.length === 0) return null;

	return upcomingShifts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
}

export async function getScheduleTimes(): Promise<Record<string, string>> {
	try {
		const querySnapshot = await getDocs(collection(fireStore, 'team_timings'));
		const timesMap: Record<string, string> = {};

		console.log('Fetching timings from Firestore collection: team_timings');
		querySnapshot.forEach((doc) => {
			const data = doc.data();
			const team = doc.id;
			const startTime = data.start;

			if (team && startTime) {
				timesMap[team] = startTime;
			}
		});

		return timesMap;
	} catch (error) {
		console.error('Error fetching schedule times from Firestore:', error);
		return {};
	}
}

export async function getGlobalSchedule(): Promise<GlobalScheduleCard[]> {
	try {
		const docRef = doc(fireStore, 'global_schedule', 'global_view');
		const docSnap = await getDoc(docRef);

		if (!docSnap.exists()) {
			console.log('No global schedule found!');
			return [];
		}

		const data = docSnap.data();
		console.log('Fetched global schedule data:', data);

		const cards: GlobalScheduleCard[] = [];

		for (const [date, teams] of Object.entries(data)) {
			if (typeof teams !== 'object' || teams === null) continue;

			const rows: import('../types').GlobalScheduleRow[] = [];

			for (const [team, roles] of Object.entries(teams)) {
				if (typeof roles !== 'object' || roles === null) continue;

				for (const [role, members] of Object.entries(roles)) {
					const memberList = Array.isArray(members) ? members : [];
					rows.push({ team, role, members: memberList });
				}
			}

			const dateObj = new Date(date);
			let formattedDate = date;
			if (!isNaN(dateObj.getTime())) {
				formattedDate = new Intl.DateTimeFormat('en-GB', {
					day: 'numeric',
					month: 'short',
					year: 'numeric'
				}).format(dateObj);
			}

			const sortedRows = rows.sort((a, b) => {
				const teamCompare = a.team.localeCompare(b.team);
				if (teamCompare !== 0) return teamCompare;
				return a.role.localeCompare(b.role);
			});

			cards.push({
				date,
				formattedDate,
				rows: sortedRows
			});
		}

		cards.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

		return cards;
	} catch (error) {
		console.error('Error fetching global schedule:', error);
		return [];
	}
}
