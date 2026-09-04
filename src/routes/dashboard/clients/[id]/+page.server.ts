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
	birth_date: z.string().optional(),
	annual_return_percent: z
		.string()
		.optional()
		.transform((v) => (v ? Number(v) : 9))
		.pipe(z.number())
});

const moneySchema = z.object({
	value: z
		.string()
		.min(1, 'Value is required')
		.transform((v) => Number(v))
		.pipe(z.number({ invalid_type_error: 'Value must be a number' })),
	type: z.enum(['deposit', 'withdraw', 'interest'], { required_error: 'Type is required' }),
	endofterm: z.string().optional(),
	startofterm: z.string().optional(),
	parent: z.string().optional()
});

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const [client, moneyEntries] = await Promise.all([
			locals.pb.collection('clients').getOne(params.id),
			locals.pb.collection('money').getFullList({
				filter: `client = "${params.id}"`,
				expand: 'parentMoneyItem',
				sort: '-created'
			})
		]);
		return { client, moneyEntries };
	} catch {
		error(404, 'Client not found');
	}
};

export const actions: Actions = {
	updateClient: async ({ params, request, locals }) => {
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
			annual_return_percent: formData.get('annual_return_percent') as string
		};

		const result = clientSchema.safeParse(raw);

		if (!result.success) {
			const errors: Record<string, string> = {};
			for (const issue of result.error.issues) {
				const field = issue.path[0] as string;
				errors[field] = issue.message;
			}
			return fail(422, { _action: 'updateClient', errors, values: raw });
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
			return fail(500, { _action: 'updateClient', serverError: message, values: raw });
		}

		return { _action: 'updateClient' as const, success: true, values: raw };
	},

	updatePassword: async ({ params, request, locals }) => {
		const formData = await request.formData();
		const password = formData.get('password') as string;

		if (!password || password.length < 8) {
			return fail(422, {
				_action: 'updatePassword',
				passwordError: 'A jelszónak legalább 8 karakter hosszúnak kell lennie.'
			});
		}

		try {
			const user = await locals.pb.collection('users').getFirstListItem(`client = "${params.id}"`);
			await locals.pb.collection('users').update(user.id, {
				password,
				passwordConfirm: password
			});
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : 'Failed to update password. Please try again.';
			return fail(500, { _action: 'updatePassword', passwordServerError: message });
		}

		return { _action: 'updatePassword' as const, success: true };
	},

	deleteMoney: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) return fail(400, { _action: 'deleteMoney', serverError: 'Missing entry ID.' });

		try {
			await locals.pb.collection('money').delete(id);
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : 'Failed to delete entry. Please try again.';
			return fail(500, { _action: 'deleteMoney', serverError: message });
		}

		return { _action: 'deleteMoney' as const, success: true };
	},

	createMoney: async ({ params, request, locals }) => {
		const formData = await request.formData();

		const rawMoney = {
			value: formData.get('value') as string,
			type: formData.get('type') as string,
			endofterm: formData.get('endofterm') ?? undefined,
			startofterm: formData.get('startofterm') ?? undefined,
			parent: formData.get('parent') ?? undefined
		};

		const result = moneySchema.safeParse(rawMoney);

		if (!result.success) {
			const moneyErrors: Record<string, string> = {};
			for (const issue of result.error.issues) {
				const field = issue.path[0] as string;
				moneyErrors[field] = issue.message;
			}
			return fail(422, { _action: 'createMoney', moneyErrors, moneyValues: rawMoney });
		}

		const moneyData = result.data;

		const payload: Record<string, unknown> = {
			client: params.id,
			value: moneyData.value,
			type: moneyData.type
		};
		if (moneyData.endofterm) payload.endofterm = moneyData.endofterm;
		if (moneyData.startofterm) payload.startofterm = moneyData.startofterm;

		if ((moneyData.type === 'withdraw' || moneyData.type === 'interest') && moneyData.parent)
			payload.parentMoneyItem = moneyData.parent;

		try {
			await locals.pb.collection('money').create(payload);
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : 'Failed to create money entry. Please try again.';
			return fail(500, {
				_action: 'createMoney',
				moneyServerError: message,
				moneyValues: rawMoney
			});
		}

		return { _action: 'createMoney' as const, success: true };
	}
};
