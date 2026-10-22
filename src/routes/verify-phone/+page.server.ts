import { redirect } from '@sveltejs/kit';
import { failure, requireUser, safeNext } from '#lib/server/problem.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	const user = requireUser(locals, url);
	if (user.phone_verified) redirect(303, safeNext(url.searchParams.get('next')));
	return { phone: user.phone ?? '', sent: url.searchParams.has('sent') };
};

export const actions: Actions = {
	send: async ({ locals }) => {
		const res = await locals.api.POST('/auth/otp/send');
		if (!res.response.ok) return failure(res);
		return { notice: 'verify.sent' as const };
	},
	verify: async ({ request, locals }) => {
		const form = await request.formData();
		const res = await locals.api.POST('/auth/otp/verify', {
			body: { code: String(form.get('code') ?? '').replace(/\D/g, '') }
		});
		if (!res.data) return failure(res, form);
		redirect(303, safeNext(form.get('next')?.toString()));
	}
};
