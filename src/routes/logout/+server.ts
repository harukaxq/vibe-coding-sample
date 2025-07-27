import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { logout } from '$lib/server/features/auth/command/logout/handler';

export const POST: RequestHandler = async ({ cookies }) => {
	const token = cookies.get('session');
	
	if (token) {
		await logout(token);
		cookies.delete('session', { path: '/' });
	}
	
	throw redirect(303, '/login');
};