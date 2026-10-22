import { redirect } from '@sveltejs/kit';
import { failure } from '#lib/server/problem.js';
import type { Actions } from './$types';

export const actions: Actions = {
	request: async ({ request, locals }) => {
		const form = await request.formData();
		const phone = String(form.get('phone') ?? '').trim();
		const res = await locals.api.POST('/auth/password/reset/request', { body: { phone } });
		if (!res.response.ok) return failure(res, form);
		return { notice: 'reset.sent' as const, values: { phone } };
	},
	confirm: async ({ request, locals }) => {
		const form = await request.formData();
		const res = await locals.api.POST('/auth/password/reset/confirm', {
			body: {
				phone: String(form.get('phone') ?? '').trim(),
				code: String(form.get('code') ?? '').replace(/\D/g, ''),
				new_password: String(form.get('new_password') ?? '')
			}
		});
		if (!res.response.ok) return failure(res, form);
		redirect(303, '/login?reset=1');
	}
};
