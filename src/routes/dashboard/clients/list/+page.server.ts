import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const clients = await locals.pb.collection('clients').getFullList({
		fields: 'id,system_id,name_first,name_last',
		sort: 'name_last,name_first'
	});

	return { clients };
};
