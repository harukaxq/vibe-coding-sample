import type { PageServerLoad } from './$types';
import { getCalendarData } from '$lib/server/features/analytics/query/get-calendar-data/handler';
import { getProjectProgress } from '$lib/server/features/analytics/query/get-project-progress/handler';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();
	
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth() + 1; // JavaScript months are 0-indexed
	
	const [calendarData, projectProgress] = await Promise.all([
		getCalendarData({ userId: user.id, year, month }),
		getProjectProgress({ userId: user.id, days: 7 })
	]);

	return {
		calendarData,
		projectProgress
	};
};