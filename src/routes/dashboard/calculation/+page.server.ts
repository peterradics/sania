import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

type Client = {
	id: string;
	name_first: string;
	name_last: string;
	annual_return_percent: number | null;
};
type Deposit = { id: string; client: string; value: number; startofterm: string };

const DEFAULT_ANNUAL_RETURN_PERCENT = 9;

async function loadRows(locals: App.Locals) {
	const [clients, deposits] = await Promise.all([
		locals.pb
			.collection('clients')
			.getFullList({ fields: 'id,name_first,name_last,annual_return_percent' }),
		locals.pb.collection('money').getFullList({
			filter: "type = 'deposit'",
			fields: 'id,client,value,startofterm',
			sort: 'client,startofterm'
		})
	]);

	const clientsById = new Map((clients as Client[]).map((c) => [c.id, c]));

	return (deposits as Deposit[])
		.filter((d) => d.client && clientsById.has(d.client))
		.map((d) => {
			const client = clientsById.get(d.client)!;
			const annualReturnPercent = client.annual_return_percent ?? DEFAULT_ANNUAL_RETURN_PERCENT;
			const interest = Math.round(((d.value * (annualReturnPercent / 100)) / 12) * 100) / 100;
			return {
				depositId: d.id,
				clientId: d.client,
				clientName: `${client.name_first} ${client.name_last}`,
				depositValue: d.value,
				depositStartofterm: d.startofterm,
				annualReturnPercent,
				interestValue: interest
			};
		});
}

export const load: PageServerLoad = async ({ locals }) => {
	const rows = await loadRows(locals);
	return { rows };
};

export const actions: Actions = {
	writeInterests: async ({ request, locals }) => {
		const formData = await request.formData();
		const startofterm = formData.get('startofterm') as string;

		if (!startofterm) {
			return fail(400, { error: 'A dátum megadása kötelező.' });
		}

		const rows = await loadRows(locals);

		let created = 0;
		let failed = 0;

		for (const row of rows) {
			try {
				await locals.pb.collection('money').create({
					client: row.clientId,
					type: 'interest',
					value: row.interestValue,
					parentMoneyItem: row.depositId,
					startofterm
				});
				created++;
			} catch {
				failed++;
			}
		}

		return { success: true, created, failed };
	}
};
