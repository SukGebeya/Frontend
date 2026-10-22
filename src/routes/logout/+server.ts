import { redirect } from '@sveltejs/kit';
import { REFRESH, clearTokens } from '#lib/server/cookies.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, locals }) => {
	const refresh_token = cookies.get(REFRESH);
	if (refresh_token) await locals.api.POST('/logout', { body: { refresh_token } });
	clearTokens(cookies);
	redirect(303, '/');
};
