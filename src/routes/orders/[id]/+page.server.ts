import { failure, requireUser, must } from '#lib/server/problem.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	requireUser(locals, url);
	const detail = must(
		await locals.api.GET('/orders/{id}', { params: { path: { id: params.id } } })
	);
	return { detail };
};

const path = (id: string) => ({ params: { path: { id } } });

export const actions: Actions = {
	confirm: async ({ locals, params }) => {
		const res = await locals.api.POST('/orders/{id}/confirm-delivery', path(params.id));
		return res.response.ok ? null : failure(res);
	},
	dispute: async ({ request, locals, params }) => {
		const form = await request.formData();
		const res = await locals.api.POST('/orders/{id}/dispute', {
			...path(params.id),
			body: { reason: String(form.get('reason') ?? '').trim() }
		});
		return res.response.ok ? null : failure(res, form);
	},
	cancel: async ({ locals, params }) => {
		const res = await locals.api.POST('/orders/{id}/cancel', path(params.id));
		return res.response.ok ? null : failure(res);
	},
	refresh: async ({ locals, params }) => {
		const res = await locals.api.POST('/orders/{id}/payment/refresh', path(params.id));
		return res.response.ok ? null : failure(res);
	}
};
