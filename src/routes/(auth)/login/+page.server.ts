import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { login } from '$lib/server/features/auth/command/login/handler';

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;

		try {
			const result = await login({ email, password });

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