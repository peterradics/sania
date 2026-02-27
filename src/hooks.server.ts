import { redirect } from '@sveltejs/kit';
import { createPocketBase } from '$lib/pocketbase';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const pb = createPocketBase();

	const authCookie = event.cookies.get('pb_auth');

	if (authCookie) {
		try {
			const { token, record } = JSON.parse(authCookie);
			pb.authStore.save(token, record);

			// Refresh token if valid
			if (pb.authStore.isValid) {
				try {
					await pb.collection('users').authRefresh();
					event.cookies.set(
						'pb_auth',
						JSON.stringify({ token: pb.authStore.token, record: pb.authStore.record }),
						{
							path: '/',
							httpOnly: true,
							sameSite: 'lax',
							secure: process.env.NODE_ENV === 'production',
							maxAge: 60 * 60 * 24 * 30
						}
					);
				} catch {
					pb.authStore.clear();
					event.cookies.delete('pb_auth', { path: '/' });
				}
			}
		} catch {
			event.cookies.delete('pb_auth', { path: '/' });
		}
	}

	event.locals.pb = pb;
	event.locals.user = pb.authStore.isValid ? pb.authStore.record : null;

	// Protect all routes except /login and /logout
	if (!event.locals.user && !event.url.pathname.startsWith('/login') && !event.url.pathname.startsWith('/logout')) {
		redirect(303, '/login');
	}

	return resolve(event);
};
