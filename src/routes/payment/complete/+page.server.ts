import { PENDING_ORDER } from '#lib/server/cookies.js';
import { requireUser, must } from '#lib/server/problem.js';
import type { PageServerLoad } from './$types';

// Chapa sends the buyer here with a fixed return URL, so the order comes from the cookie set at checkout.
export const load: PageServerLoad = async ({ locals, cookies, url }) => {
	requireUser(locals, url);
	const orderId = url.searchParams.get('order') ?? cookies.get(PENDING_ORDER);
	if (!orderId) return { order: null };

	// Re-verifies with Chapa now instead of waiting for the webhook.
	const order = must(
		await locals.api.POST('/orders/{id}/payment/refresh', { params: { path: { id: orderId } } })
	);
	if (order.status !== 'pending_payment') cookies.delete(PENDING_ORDER, { path: '/' });
	return { order };
};
