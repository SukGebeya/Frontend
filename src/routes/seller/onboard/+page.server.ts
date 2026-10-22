import { redirect } from '@sveltejs/kit';
import { translate } from '#lib/i18n/index.js';
import { money, optionalText, text } from '#lib/server/forms.js';
import { failure, invalid, requireUser } from '#lib/server/problem.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = requireUser(locals, url);
	const profile = await locals.api.GET('/merchant/profile');
	if (profile.data) redirect(303, '/seller');
	return { phoneVerified: user.phone_verified, phone: user.phone ?? '' };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const deliveryFee = money(form, 'delivery_fee');
		const freeOver = money(form, 'free_over');
		const badAmount = translate(locals.lang, 'common.invalidAmount');
		if (deliveryFee === null) return invalid(badAmount, form, { delivery_fee: badAmount });
		if (freeOver === null) return invalid(badAmount, form, { free_over: badAmount });

		const res = await locals.api.POST('/merchant/onboard', {
			body: {
				shop_name: text(form, 'shop_name'),
				shop_slug: optionalText(form, 'shop_slug'),
				shop_description: optionalText(form, 'shop_description'),
				contact_phone: text(form, 'contact_phone'),
				city: text(form, 'city'),
				delivery_fee_cents: deliveryFee ?? 0,
				free_delivery_threshold_cents: freeOver,
				tin: optionalText(form, 'tin')
			}
		});
		if (!res.response.ok) return failure(res, form);
		redirect(303, '/seller');
	}
};
