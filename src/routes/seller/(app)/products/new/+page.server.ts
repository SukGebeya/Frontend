import { redirect } from '@sveltejs/kit';
import { translate } from '#lib/i18n/index.js';
import { integer, money, optionalText, text } from '#lib/server/forms.js';
import { failure, invalid } from '#lib/server/problem.js';
import { generateSku } from '#lib/server/sku.js';
import type { Actions } from './$types';

// One form lists an item: the product, its first option with price and stock, and an optional image.
export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const price = money(form, 'price');
		const stock = integer(form, 'stock');
		if (!price) {
			const message = translate(locals.lang, 'common.invalidAmount');
			return invalid(message, form, { price: message });
		}
		if (stock === null) {
			const message = translate(locals.lang, 'common.invalidNumber');
			return invalid(message, form, { stock: message });
		}

		const product = await locals.api.POST('/merchant/products', {
			body: {
				name: text(form, 'name'),
				description: optionalText(form, 'description'),
				status: 'active'
			}
		});
		if (!product.data) return failure(product, form);
		const id = product.data.id;

		const variant = await locals.api.POST('/merchant/products/{id}/variants', {
			params: { path: { id } },
			body: {
				sku: generateSku(),
				title: text(form, 'variant_title') || 'Standard',
				price_cents: price,
				currency: 'ETB',
				is_active: true,
				stock_quantity: stock
			}
		});

		const imageUrl = optionalText(form, 'image_url');
		if (variant.response.ok && imageUrl) {
			await locals.api.POST('/merchant/products/{id}/images', {
				params: { path: { id } },
				body: { url: imageUrl, is_primary: true }
			});
		}
		// The product exists either way; the edit page shows what still needs fixing.
		redirect(303, `/seller/products/${id}?created=1`);
	}
};
