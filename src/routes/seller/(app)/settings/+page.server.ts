import { translate } from '#lib/i18n/index.js';
import { money, text } from '#lib/server/forms.js';
import { failure, invalid } from '#lib/server/problem.js';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const deliveryFee = money(form, 'delivery_fee');
		const freeOver = money(form, 'free_over');
		const message = translate(locals.lang, 'common.invalidAmount');
		if (deliveryFee === null || deliveryFee === undefined)
			return invalid(message, form, { delivery_fee: message });
		if (freeOver === null) return invalid(message, form, { free_over: message });

		const res = await locals.api.PUT('/merchant/profile', {
			body: {
				shop_name: text(form, 'shop_name'),
				shop_description: text(form, 'shop_description'),
				contact_phone: text(form, 'contact_phone'),
				city: text(form, 'city'),
				delivery_fee_cents: deliveryFee,
				free_delivery_threshold_cents: freeOver,
				clear_free_delivery_threshold: freeOver === undefined
			}
		});
		if (!res.response.ok) return failure(res, form);
		return { notice: 'seller.settingsSaved' as const };
	}
};
