import type { Order, Paginated } from '#lib/api/types.js';
import { must } from '#lib/server/problem.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const orders = must(
		await locals.api.GET('/merchant/orders', { params: { query: { page, per_page: 20 } } })
	);
	return { orders: orders as Paginated<Order> };
};
