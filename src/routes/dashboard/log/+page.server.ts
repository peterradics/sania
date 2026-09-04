import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const origins = await locals.pb.collection('_authOrigins').getList(1, 200, {
		sort: '-updated'
	});

	const userIds = [...new Set(origins.items.map((o) => o.recordRef as string))].filter(Boolean);

	const users = await Promise.all(
		userIds.map((id) =>
			locals.pb
				.collection('users')
				.getOne(id, { fields: 'id,name,email' })
				.catch(() => null)
		)
	);

	const usersById = new Map(
		(users.filter(Boolean) as Array<{ id: string; name: string; email: string }>).map((u) => [
			u.id,
			u
		])
	);

	const entries = origins.items
		.map((o) => {
			const user = usersById.get(o.recordRef as string);
			if (!user) return null;
			return {
				id: o.id as string,
				name: user.name ?? '',
				email: user.email ?? '',
				created: o.created as string,
				updated: o.updated as string
			};
		})
		.filter((e) => e !== null);

	return { entries };
};
