import { must } from '#lib/server/problem.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	return { dashboard: must(await locals.api.GET('/merchant/dashboard')) };
};
