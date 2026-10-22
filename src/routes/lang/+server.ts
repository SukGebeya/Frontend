import { redirect } from '@sveltejs/kit';
import { isLang } from '#lib/i18n/index.js';
import { setLang } from '#lib/server/cookies.js';
import { safeNext } from '#lib/server/problem.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const form = await request.formData();
	const lang = form.get('lang');
	if (isLang(lang)) setLang(cookies, lang);
	redirect(303, safeNext(form.get('next')?.toString()));
};
