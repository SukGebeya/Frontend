import { redirect } from '@sveltejs/kit';
import { requireUser, must } from '#lib/server/problem.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	requireUser(locals, url);
	const res = await locals.api.GET('/merchant/profile');
	// The API answers 403 until the user has completed onboarding.
	if (res.response.status === 403) redirect(303, '/seller/onboard');
	return { profile: must(res) };
};
