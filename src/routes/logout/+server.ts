import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ cookies }) => {
	cookies.delete('pb_auth', { path: '/' });
	redirect(303, '/login');
};
