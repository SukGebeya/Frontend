import { redirect } from '@sveltejs/kit';
import { isEthiopianMobile } from '#lib/phone.js';
import { signIn } from '#lib/server/auth.js';
import { failure, invalid, safeNext } from '#lib/server/problem.js';
import { translate } from '#lib/i18n/index.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	if (locals.user) redirect(303, safeNext(url.searchParams.get('next')));
};

export const actions: Actions = {
	default: async ({ request, locals, cookies, url }) => {
		const form = await request.formData();
		const phone = String(form.get('phone') ?? '').trim();
		const email = String(form.get('email') ?? '').trim();
		if (!isEthiopianMobile(phone)) {
			const message = translate(locals.lang, 'auth.invalidPhone');
			return invalid(message, form, { phone: message });
		}

		const res = await locals.api.POST('/register', {
			body: { phone, email: email || undefined, password: String(form.get('password') ?? '') }
		});
		if (!res.data) return failure(res, form);
		await signIn(locals.api, cookies, res.data.token);

		const sent = await locals.api.POST('/auth/otp/send');
		const next = safeNext(url.searchParams.get('next'));
		redirect(
			303,
			`/verify-phone?next=${encodeURIComponent(next)}${sent.response.ok ? '&sent=1' : ''}`
		);
	}
};
