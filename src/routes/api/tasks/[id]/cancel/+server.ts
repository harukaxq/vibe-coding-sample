import { json } from '@sveltejs/kit';
import { cancelTask } from '$lib/server/features/task/command/cancel-task/handler';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, params }) => {
  const session = await locals.auth.validate();
  if (!session) {
    return json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id: taskId } = params;

  try {
    const updatedTask = await cancelTask({ taskId, userId: session.user.userId });
    return json(updatedTask);
  } catch (error) {
    if (error instanceof Error) {
      return json({ message: error.message }, { status: 400 });
    }
    return json({ message: '予期せぬエラーが発生しました' }, { status: 500 });
  }
};
