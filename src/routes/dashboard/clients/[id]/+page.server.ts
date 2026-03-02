import { fail, error } from '@sveltejs/kit';
import { z } from 'zod';
import type { PageServerLoad, Actions } from './$types';

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

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const client = await locals.pb.collection('clients').getOne(params.id);
		return { client };
	} catch {
		error(404, 'Client not found');
	}
};

export const actions: Actions = {
	default: async ({ params, request, locals }) => {
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
			birth_date: formData.get('birth_date') as string
		};

		const result = clientSchema.safeParse(raw);

		if (!result.success) {
			const errors: Record<string, string> = {};
			for (const issue of result.error.issues) {
				const field = issue.path[0] as string;
				errors[field] = issue.message;
			}
			return fail(422, { errors, values: raw });
		}

		const data = result.data;

		const payload: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(data)) {
			if (value !== undefined && value !== '') {
				payload[key] = value;
			}
		}

		try {
			await locals.pb.collection('clients').update(params.id, payload);
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : 'Failed to update client. Please try again.';
			return fail(500, { serverError: message, values: raw });
		}

		return { success: true, values: raw };
	}
};
