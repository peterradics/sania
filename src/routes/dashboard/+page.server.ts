import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const [clients, allMoney] = await Promise.all([
		locals.pb.collection('clients').getFullList({
			fields: 'id,system_id,name_first,name_last,created',
			sort: '-created'
		}),
		locals.pb.collection('money').getFullList({
			fields: 'client,value,type'
		})
	]);

	const balanceByClient: Record<string, number> = {};
	let totalDeposits = 0;
	let totalInterest = 0;

	for (const entry of allMoney as Array<{ client: string; value: number; type: string }>) {
		if (!entry.client) continue;
		if (!balanceByClient[entry.client]) balanceByClient[entry.client] = 0;

		if (entry.type === 'deposit') {
			balanceByClient[entry.client] += entry.value ?? 0;
			totalDeposits += entry.value ?? 0;
		} else if (entry.type === 'interest') {
			balanceByClient[entry.client] += entry.value ?? 0;
			totalInterest += entry.value ?? 0;
		} else if (entry.type === 'withdraw') {
			balanceByClient[entry.client] -= entry.value ?? 0;
		}
	}

	const totalBalance = Object.values(balanceByClient).reduce((s, v) => s + v, 0);

	const latestClients = (clients as Array<Record<string, unknown>>).slice(0, 10);

	return { totalBalance, totalDeposits, totalInterest, latestClients, balanceByClient };
};
