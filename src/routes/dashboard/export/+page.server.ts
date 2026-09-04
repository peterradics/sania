import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const [clients, deposits] = await Promise.all([
		locals.pb.collection('clients').getFullList({
			fields: 'id,system_id,name_first,name_last,email',
			sort: 'system_id'
		}),
		locals.pb.collection('money').getFullList({
			filter: "type = 'deposit'",
			fields: 'client,value,startofterm',
			sort: 'startofterm'
		})
	]);

	const firstDepositByClient = new Map<string, { value: number; startofterm: string }>();
	for (const d of deposits as Array<{ client: string; value: number; startofterm: string }>) {
		if (!firstDepositByClient.has(d.client)) {
			firstDepositByClient.set(d.client, { value: d.value, startofterm: d.startofterm });
		}
	}

	const rows = (
		clients as Array<{
			id: string;
			system_id: number | null;
			name_first: string;
			name_last: string;
			email: string;
		}>
	).map((c) => {
		const fd = firstDepositByClient.get(c.id);
		return {
			system_id: c.system_id ?? '',
			full_name: `${c.name_first} ${c.name_last}`,
			email: c.email ?? '',
			first_deposit_value: fd?.value ?? '',
			first_deposit_date: fd?.startofterm ? fd.startofterm.split(' ')[0] : ''
		};
	});

	return { rows };
};
