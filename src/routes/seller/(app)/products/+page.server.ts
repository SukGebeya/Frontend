import type { Paginated, Product } from '#lib/api/types.js';
import { must } from '#lib/server/problem.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const products = must(
		await locals.api.GET('/merchant/products', { params: { query: { page, per_page: 20 } } })
	);
	return { products: products as Paginated<Product> };
};
