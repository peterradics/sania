import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const clients = await locals.pb.collection('clients').getFullList({
		fields: 'system_id'
	});

	const maxId = (clients as Array<{ system_id: number | null }>)
		.map((c) => c.system_id ?? 0)
		.reduce((max, v) => Math.max(max, v), 0);

	return { maxSystemId: maxId };
};

const clientSchema = z.object({
	name_first: z.string().min(1, 'First name is required'),
	name_last: z.string().min(1, 'Last name is required'),
	email: z.string().email('Invalid email address').or(z.literal('')).optional(),
	phone_number: z.string().optional(),
	system_id: z
		.string()
		.optional()
		.transform((v) => (v ? Number(v) : undefined))
		.pipe(z.number().optional()),
	adress_street: z.string().optional(),
	address_zip: z.string().optional(),
	address_city: z.string().optional(),
	address_country: z.string().optional(),
	birth_place: z.string().optional(),
	birth_date: z.string().optional()
});

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();

		const raw = {
			name_first: formData.get('name_first') as string,
			name_last: formData.get('name_last') as string,
			email: formData.get('email') as string,
			phone_number: formData.get('phone_number') as string,
			system_id: formData.get('system_id') as string,
			adress_street: formData.get('adress_street') as string,
			address_zip: formData.get('address_zip') as string,
			address_city: formData.get('address_city') as string,
			address_country: formData.get('address_country') as string,
			birth_place: formData.get('birth_place') as string,
			birth_date: formData.get('birth_date') as string,
			password: formData.get('password') as string
		};

		const result = clientSchema.safeParse(raw);

		if (!result.success) {
			const errors: Record<string, string> = {};
			for (const issue of result.error.issues) {
				const field = issue.path[0] as string;
				errors[field] = issue.message;
			}
			console.log(errors);
			return fail(422, { errors, values: raw });
		}

		const data = result.data;

		// Remove empty optional fields
		const payload: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(data)) {
			if (value !== undefined && value !== '') {
				payload[key] = value;
			}
		}

		let theNewCLient: RecordModel;

		try {
			theNewCLient = await locals.pb.collection('clients').create(payload);
		} catch (err: unknown) {
			console.log(err);
			const message =
				err instanceof Error ? err.message : 'Failed to create client. Please try again.';
			return fail(500, { serverError: message, values: raw });
		}

		try {
			console.log(theNewCLient);
			// create user
			const userData = {
				email: theNewCLient.email,
				emailVisibility: false,
				name: theNewCLient.name_first + ' ' + theNewCLient.name_last,
				system_id: theNewCLient.system_id,
				client: theNewCLient.id,
				password: raw.password,
				passwordConfirm: raw.password
			};
			await locals.pb.collection('users').create(userData);
		} catch (err: unknown) {
			console.log(err);
			const message =
				err instanceof Error ? err.message : 'Failed to create user. Please try again.';
			return fail(500, { serverError: message, values: raw });
		}

		redirect(303, '/dashboard/clients');
	}
};
