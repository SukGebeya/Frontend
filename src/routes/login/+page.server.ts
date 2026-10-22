import { redirect } from '@sveltejs/kit';
import { signIn } from '#lib/server/auth.js';
import { failure, safeNext } from '#lib/server/problem.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	if (locals.user) redirect(303, safeNext(url.searchParams.get('next')));
	return { reset: url.searchParams.has('reset') };
};

export const actions: Actions = {
	default: async ({ request, locals, cookies, url }) => {
		const form = await request.formData();
		const res = await locals.api.POST('/login', {
			body: {
				identifier: String(form.get('identifier') ?? '').trim(),
				password: String(form.get('password') ?? '')
			}
		});
		if (!res.data) return failure(res, form);
		await signIn(locals.api, cookies, res.data.token);
		redirect(303, safeNext(url.searchParams.get('next')));
	}
};
