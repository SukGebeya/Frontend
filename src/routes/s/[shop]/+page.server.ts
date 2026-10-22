import { must } from '#lib/server/problem.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const shop = must(
		await locals.api.GET('/shops/{shop_slug}', { params: { path: { shop_slug: params.shop } } })
	);
	const page = Number(url.searchParams.get('page')) || 1;
	const products = must(
		await locals.api.GET('/products', {
			params: { query: { merchant_id: shop.merchant_id, page, per_page: 24 } }
		})
	);
	return { shop, products };
};
