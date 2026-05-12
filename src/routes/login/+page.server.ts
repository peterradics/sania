import { redirect, type Actions, fail } from '@sveltejs/kit';
import { createPocketBase } from '$lib/pocketbase';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;

		const pb = createPocketBase();

		try {
			const auth = await pb.collection('_superusers').authWithPassword(email, password);

			console.log(auth);

			cookies.set('pb_auth', JSON.stringify({ token: auth.token, record: auth.record }), {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 1 // 1 day
			});
		} catch {
			return fail(400, { error: 'Invalid email or password' });
		}

		redirect(303, '/dashboard/clients');
	}
};
