import type { Order, Paginated } from '#lib/api/types.js';
import { must } from '#lib/server/problem.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const [orders, dashboard] = await Promise.all([
		locals.api.GET('/merchant/orders', { params: { query: { page, per_page: 20 } } }).then(must),
		// Only for the "orders need you" count, so the list still shows if this fails.
		locals.api.GET('/merchant/dashboard').then((res) => res.data)
	]);
	return {
		orders: orders as Paginated<Order>,
		actionRequired: dashboard?.orders_action_required ?? 0
	};
};
