import { redirect } from '@sveltejs/kit';
import { failure, invalid, must } from '#lib/server/problem.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const detail = must(
		await locals.api.GET('/products/{slug}', { params: { path: { slug: params.slug } } })
	);
	return { detail };
};

async function addToCart(locals: App.Locals, form: FormData, replaceCart: boolean) {
	const variant_id = String(form.get('variant_id') ?? '');
	const quantity = Number(form.get('quantity') ?? 1);
	if (!variant_id || !Number.isInteger(quantity) || quantity < 1) {
		return invalid('Choose an option and a quantity.', form);
	}
	// Checkout takes one shop per order, so "Buy now" starts from an empty cart.
	if (replaceCart) await locals.api.DELETE('/cart');
	const res = await locals.api.POST('/cart/items', { body: { variant_id, quantity } });
	return res.response.ok ? null : failure(res, form);
}

export const actions: Actions = {
	buy: async ({ request, locals }) => {
		const failed = await addToCart(locals, await request.formData(), true);
		if (failed) return failed;
		redirect(303, '/checkout');
	},
	add: async ({ request, locals }) => {
		const failed = await addToCart(locals, await request.formData(), false);
		return failed ?? { notice: 'product.added' as const };
	}
};
