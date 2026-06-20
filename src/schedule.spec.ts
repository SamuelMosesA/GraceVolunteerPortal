import { vi, describe, it, expect } from 'vitest';
import { getGlobalSchedule } from './lib/firebase/schedule.svelte';

vi.mock('$env/static/public', () => ({
	PUBLIC_APIKEY: 'mock-key',
	PUBLIC_AUTHDOMAIN: 'mock-domain',
	PUBLIC_PROJECTID: 'mock-id',
	PUBLIC_STORAGEBUCKET: 'mock-bucket',
	PUBLIC_MESSAGINGSENDERID: 'mock-sender',
	PUBLIC_APPID: 'mock-app-id',
	PUBLIC_MEASUREMENTID: 'mock-measurement-id'
}));

const mockDocData = {
	'2026-06-12': {
		Media: {
			Slides: ['Alice', 'Bob'],
			Lyrics: ['Dave']
		},
		Sound: {
			Mix: ['Charlie']
		}
	}
};

vi.mock('firebase/firestore', () => {
	return {
		getFirestore: vi.fn(),
		doc: vi.fn(),
		getDocs: vi.fn(),
		collection: vi.fn(),
		getDoc: vi.fn().mockResolvedValue({
			exists: () => true,
			data: () => mockDocData
		})
	};
});

describe('getGlobalSchedule', () => {
	it('should correctly format date to "DD MMM YYYY" and sort rows by team then role', async () => {
		const scheduleCards = await getGlobalSchedule();
		expect(scheduleCards).toHaveLength(1);

		const card = scheduleCards[0];
		expect(card.date).toBe('2026-06-12');
		expect(card.formattedDate).toBe('12 Jun 2026');

		expect(card.rows).toHaveLength(3);
		// Sorted order should be:
		// 1. Media: Lyrics
		// 2. Media: Slides
		// 3. Sound: Mix
		expect(card.rows[0]).toEqual({
			team: 'Media',
			role: 'Lyrics',
			members: ['Dave']
		});
		expect(card.rows[1]).toEqual({
			team: 'Media',
			role: 'Slides',
			members: ['Alice', 'Bob']
		});
		expect(card.rows[2]).toEqual({
			team: 'Sound',
			role: 'Mix',
			members: ['Charlie']
		});
	});
});
