import { randomUUID } from 'node:crypto';
import { redirect } from '@sveltejs/kit';
import { storePendingOrder } from '#lib/server/cookies.js';
import { failure, invalid, requireUser, must } from '#lib/server/problem.js';
import { translate } from '#lib/i18n/index.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = requireUser(locals, url);
	const [cart, addresses] = await Promise.all([
		locals.api.GET('/cart').then(must),
		locals.api.GET('/addresses').then(must)
	]);
	if (!cart.items?.length) redirect(303, '/cart');
	return {
		cart,
		addresses: addresses ?? [],
		phoneVerified: user.phone_verified,
		// One key per rendered form: a double submit replays the same checkout instead of creating two orders.
		idempotencyKey: randomUUID()
	};
};

const optional = (form: FormData, key: string) => {
	const value = String(form.get(key) ?? '').trim();
	return value || undefined;
};

export const actions: Actions = {
	address: async ({ request, locals }) => {
		const form = await request.formData();
		const res = await locals.api.POST('/addresses', {
			body: {
				full_name: String(form.get('full_name') ?? '').trim(),
				phone: String(form.get('phone') ?? '').trim(),
				line1: String(form.get('line1') ?? '').trim(),
				line2: optional(form, 'line2'),
				city: String(form.get('city') ?? '').trim(),
				subcity: optional(form, 'subcity'),
				woreda: optional(form, 'woreda'),
				is_default: true
			}
		});
		if (!res.data) return failure(res, form);
		return { addressId: res.data.id };
	},
	pay: async ({ request, locals, cookies }) => {
		const form = await request.formData();
		const shipping_address_id = optional(form, 'shipping_address_id');
		if (!shipping_address_id)
			return invalid(translate(locals.lang, 'checkout.chooseAddress'), form);

		const res = await locals.api.POST('/orders/checkout', {
			params: { header: { 'Idempotency-Key': String(form.get('idempotency_key') ?? '') } },
			body: { shipping_address_id, notes: optional(form, 'notes') }
		});
		if (!res.data) return failure(res, form);
		storePendingOrder(cookies, res.data.order_id);
		redirect(303, res.data.payment_url, { external: true });
	}
};
