import { failure, must } from '#lib/server/problem.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	return { cart: must(await locals.api.GET('/cart')) };
};

export const actions: Actions = {
	update: async ({ request, locals }) => {
		const form = await request.formData();
		const variantId = String(form.get('variant_id') ?? '');
		const res = await locals.api.PUT('/cart/items/{variantId}', {
			params: { path: { variantId } },
			body: { quantity: Number(form.get('quantity') ?? 0) }
		});
		return res.response.ok ? null : failure(res, form);
	},
	remove: async ({ request, locals }) => {
		const form = await request.formData();
		const variantId = String(form.get('variant_id') ?? '');
		const res = await locals.api.DELETE('/cart/items/{variantId}', {
			params: { path: { variantId } }
		});
		return res.response.ok ? null : failure(res, form);
	}
};
