import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const [clients, allMoney] = await Promise.all([
		locals.pb.collection('clients').getFullList({
			fields: 'id,system_id,name_first,name_last',
			sort: 'name_last,name_first'
		}),
		locals.pb.collection('money').getFullList({
			fields: 'client,value,type,startofterm',
			sort: 'created'
		})
	]);

	const balanceByClient: Record<string, number> = {};
	const firstDepositByClient: Record<string, { value: number; startofterm: string }> = {};

	for (const entry of allMoney as Array<{
		client: string;
		value: number;
		type: string;
		startofterm: string;
		endofterm: string;
	}>) {
		if (!entry.client) continue;
		if (!balanceByClient[entry.client]) balanceByClient[entry.client] = 0;
		balanceByClient[entry.client] +=
			entry.type === 'withdraw' ? -(entry.value ?? 0) : (entry.value ?? 0);

		if (entry.type === 'deposit' && !firstDepositByClient[entry.client]) {
			firstDepositByClient[entry.client] = { value: entry.value, startofterm: entry.startofterm };
		}
	}

	return { clients, balanceByClient, firstDepositByClient };
};
