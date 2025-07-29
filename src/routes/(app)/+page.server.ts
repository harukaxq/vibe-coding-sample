import type { PageServerLoad, Actions } from './$types';
import { getProjects } from '$lib/server/features/project/query/get-projects/handler';
import { getTasks } from '$lib/server/features/task/query/get-tasks/handler';
import { createProject } from '$lib/server/features/project/command/create-project/handler';
import { createTaskWithProject } from '$lib/server/flows/create-task-with-project/handler';
import { toggleTaskStatus } from '$lib/server/features/task/command/toggle-task-status/handler';
import { cancelTask } from '$lib/server/features/task/command/cancel-task/handler';
import { startPomodoroForTask } from '$lib/server/flows/start-pomodoro-for-task/handler';
import { completeSession } from '$lib/server/features/pomodoro-session/command/complete-session/handler';
import { PomodoroSessionRepositoryPrisma } from '$lib/server/adapter/repository/pomodoroSessionRepository.prisma';
import { fail } from '@sveltejs/kit';
import { getAuthUser } from '$lib/server/auth';

const sessionRepository = new PomodoroSessionRepositoryPrisma();

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();
	
	const [projects, tasks, activeSession] = await Promise.all([
		getProjects({ userId: user.id }),
		getTasks({ userId: user.id }),
		sessionRepository.findActiveByUserId(user.id)
	]);

	return {
		projects,
		tasks,
		activeSession
	};
};

export const actions: Actions = {
	createProject: async (event) => {
		const user = await getAuthUser(event);
		if (!user) return fail(401, { error: '認証が必要です' });
		
		const data = await event.request.formData();
		const name = data.get('name') as string;
		const color = data.get('color') as string;
		const targetPomodoros = parseInt(data.get('targetPomodoros') as string) || 0;
		const userId = user.id;

		try {
			await createProject({
				name,
				color,
				targetPomodoros,
				userId
			});
			return { success: true };
		} catch (error) {
			if (error instanceof Error) {
				return fail(400, { error: error.message });
			}
			throw error;
		}
	},

	createTask: async (event) => {
		const user = await getAuthUser(event);
		if (!user) return fail(401, { error: '認証が必要です' });
		
		const data = await event.request.formData();
		const title = data.get('title') as string;
		const description = data.get('description') as string;
		const projectId = data.get('projectId') as string;
		const estimatedPomodoros = parseInt(data.get('estimatedPomodoros') as string) || 1;
		const userId = user.id;

		try {
			await createTaskWithProject({
				title,
				description: description || undefined,
				projectId,
				estimatedPomodoros,
				userId
			});
			return { success: true };
		} catch (error) {
			if (error instanceof Error) {
				return fail(400, { error: error.message });
			}
			throw error;
		}
	},

	toggleTask: async (event) => {
		const user = await getAuthUser(event);
		if (!user) return fail(401, { error: '認証が必要です' });
		
		const data = await event.request.formData();
		const taskId = data.get('taskId') as string;
		const userId = user.id;

		try {
			await toggleTaskStatus({ taskId, userId });
			return { success: true };
		} catch (error) {
			if (error instanceof Error) {
				return fail(400, { error: error.message });
			}
			throw error;
		}
	},

	cancelTask: async (event) => {
		const user = await getAuthUser(event);
		if (!user) return fail(401, { error: '認証が必要です' });

		const data = await event.request.formData();
		const taskId = data.get('taskId') as string;
		const userId = user.id;

		try {
			await cancelTask({ taskId, userId });
			return { success: true };
		} catch (error) {
			if (error instanceof Error) {
				return fail(400, { error: error.message });
			}
			throw error;
		}
	},

	startPomodoro: async (event) => {
		const user = await getAuthUser(event);
		if (!user) return fail(401, { error: '認証が必要です' });
		
		const data = await event.request.formData();
		const taskId = data.get('taskId') as string;
		const userId = user.id;

		try {
			await startPomodoroForTask({ taskId, userId });
			return { success: true };
		} catch (error) {
			if (error instanceof Error) {
				return fail(400, { error: error.message });
			}
			throw error;
		}
	},

	completePomodoro: async (event) => {
		const user = await getAuthUser(event);
		if (!user) return fail(401, { error: '認証が必要です' });
		
		const data = await event.request.formData();
		const sessionId = data.get('sessionId') as string;
		const userId = user.id;

		try {
			await completeSession({ sessionId, userId });
			return { success: true };
		} catch (error) {
			if (error instanceof Error) {
				return fail(400, { error: error.message });
			}
			throw error;
		}
	}
};