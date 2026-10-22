import { redirect } from '@sveltejs/kit';
import { translate } from '#lib/i18n/index.js';
import { integer, money, optionalText, text } from '#lib/server/forms.js';
import { failure, invalid, must } from '#lib/server/problem.js';
import { generateSku } from '#lib/server/sku.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const detail = must(
		await locals.api.GET('/merchant/products/{id}', { params: { path: { id: params.id } } })
	);
	return { detail, created: url.searchParams.has('created') };
};

const saved = { notice: 'products.saved' as const };

export const actions: Actions = {
	update: async ({ request, locals, params }) => {
		const form = await request.formData();
		const status = text(form, 'status');
		const res = await locals.api.PUT('/merchant/products/{id}', {
			params: { path: { id: params.id } },
			body: {
				name: text(form, 'name'),
				description: text(form, 'description'),
				status:
					status === 'draft' || status === 'active' || status === 'archived' ? status : undefined
			}
		});
		return res.response.ok ? saved : failure(res, form);
	},

	addVariant: async ({ request, locals, params }) => {
		const form = await request.formData();
		const price = money(form, 'price');
		const stock = integer(form, 'stock');
		if (!price) return invalid(translate(locals.lang, 'common.invalidAmount'), form);
		if (stock === null) return invalid(translate(locals.lang, 'common.invalidNumber'), form);
		const res = await locals.api.POST('/merchant/products/{id}/variants', {
			params: { path: { id: params.id } },
			body: {
				sku: optionalText(form, 'sku') ?? generateSku(),
				title: text(form, 'title'),
				price_cents: price,
				currency: 'ETB',
				is_active: true,
				stock_quantity: stock
			}
		});
		return res.response.ok ? saved : failure(res, form);
	},

	updateVariant: async ({ request, locals, params }) => {
		const form = await request.formData();
		const price = money(form, 'price');
		if (price === null || price === 0)
			return invalid(translate(locals.lang, 'common.invalidAmount'), form);
		const active = text(form, 'is_active');
		const res = await locals.api.PUT('/merchant/products/{id}/variants/{variantId}', {
			params: { path: { id: params.id, variantId: text(form, 'variant_id') } },
			body: {
				title: optionalText(form, 'title'),
				price_cents: price,
				is_active: active === '' ? undefined : active === 'true'
			}
		});
		return res.response.ok ? saved : failure(res, form);
	},

	setStock: async ({ request, locals, params }) => {
		const form = await request.formData();
		const quantity = integer(form, 'quantity');
		if (quantity === null) return invalid(translate(locals.lang, 'common.invalidNumber'), form);
		const res = await locals.api.PUT('/merchant/products/{id}/variants/{variantId}/stock', {
			params: { path: { id: params.id, variantId: text(form, 'variant_id') } },
			body: { quantity }
		});
		return res.response.ok ? saved : failure(res, form);
	},

	deleteVariant: async ({ request, locals, params }) => {
		const form = await request.formData();
		const res = await locals.api.DELETE('/merchant/products/{id}/variants/{variantId}', {
			params: { path: { id: params.id, variantId: text(form, 'variant_id') } }
		});
		return res.response.ok ? saved : failure(res, form);
	},

	addImage: async ({ request, locals, params }) => {
		const form = await request.formData();
		const res = await locals.api.POST('/merchant/products/{id}/images', {
			params: { path: { id: params.id } },
			body: { url: text(form, 'url'), is_primary: form.get('is_primary') === 'on' }
		});
		return res.response.ok ? saved : failure(res, form);
	},

	deleteImage: async ({ request, locals, params }) => {
		const form = await request.formData();
		const res = await locals.api.DELETE('/merchant/products/{id}/images/{imageId}', {
			params: { path: { id: params.id, imageId: text(form, 'image_id') } }
		});
		return res.response.ok ? saved : failure(res, form);
	},

	delete: async ({ locals, params }) => {
		const res = await locals.api.DELETE('/merchant/products/{id}', {
			params: { path: { id: params.id } }
		});
		if (!res.response.ok) return failure(res);
		redirect(303, '/seller/products');
	}
};
