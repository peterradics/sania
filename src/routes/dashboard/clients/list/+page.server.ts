import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const [clients, allMoney] = await Promise.all([
		locals.pb.collection('clients').getFullList({
			fields: 'id,system_id,name_first,name_last',
			sort: 'name_last,name_first'
		}),
		locals.pb.collection('money').getFullList({
			fields: 'client,value,type'
		})
	]);

	const balanceByClient: Record<string, number> = {};
	for (const entry of allMoney as Array<{ client: string; value: number; type: string }>) {
		if (!entry.client) continue;
		if (!balanceByClient[entry.client]) balanceByClient[entry.client] = 0;
		balanceByClient[entry.client] +=
			entry.type === 'withdraw' ? -(entry.value ?? 0) : (entry.value ?? 0);
	}

	return { clients, balanceByClient };
};
