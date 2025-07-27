import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { registerAndLogin } from '$lib/server/flows/register-and-login/handler';

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;
		const name = data.get('name') as string;

		try {
			const result = await registerAndLogin({ 
				email, 
				password,
				name: name || undefined
			});

			// セッションクッキーを設定
			cookies.set('session', result.session.token, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 // 24時間
			});

			throw redirect(303, '/');
		} catch (error) {
			if (error instanceof Error) {
				return fail(400, { error: error.message });
			}
			throw error;
		}
	}
};