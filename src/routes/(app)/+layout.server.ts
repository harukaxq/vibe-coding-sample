import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getAuthUser } from '$lib/server/auth';

export const load: LayoutServerLoad = async (event) => {
	const user = await getAuthUser(event);
	
	if (!user) {
		throw redirect(303, '/login');
	}

	return {
		user: {
			id: user.id,
			email: user.email,
			name: user.name
		}
	};
};