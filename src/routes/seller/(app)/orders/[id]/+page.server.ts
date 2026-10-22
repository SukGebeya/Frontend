import { optionalText } from '#lib/server/forms.js';
import { failure, must } from '#lib/server/problem.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const detail = must(
		await locals.api.GET('/merchant/orders/{id}', { params: { path: { id: params.id } } })
	);
	return { detail };
};

const path = (id: string) => ({ params: { path: { id } } });

export const actions: Actions = {
	accept: async ({ locals, params }) => {
		const res = await locals.api.PUT('/merchant/orders/{id}/status', {
			...path(params.id),
			body: { status: 'processing' }
		});
		return res.response.ok ? null : failure(res);
	},
	ship: async ({ request, locals, params }) => {
		const form = await request.formData();
		const res = await locals.api.PUT('/merchant/orders/{id}/ship', {
			...path(params.id),
			body: {
				carrier: optionalText(form, 'carrier'),
				tracking_number: optionalText(form, 'tracking_number'),
				estimated_delivery: optionalText(form, 'estimated_delivery')
			}
		});
		return res.response.ok ? null : failure(res, form);
	},
	cancel: async ({ locals, params }) => {
		const res = await locals.api.POST('/merchant/orders/{id}/cancel', path(params.id));
		return res.response.ok ? null : failure(res);
	}
};
