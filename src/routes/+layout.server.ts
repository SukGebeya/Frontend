import { CART_SESSION } from '#lib/server/cookies.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => ({
	user: locals.user,
	lang: locals.lang,
	cartCount: await cartCount(locals, cookies.get(CART_SESSION))
});

/** Items in the cart, for the header badge. Never fails the page. */
async function cartCount(locals: App.Locals, session: string | undefined): Promise<number> {
	// GET /cart creates a cart for a new visitor, so only ask when one can already exist.
	if (!locals.user && !session) return 0;
	try {
		const { data } = await locals.api.GET('/cart');
		return data?.items?.reduce((n, item) => n + item.quantity, 0) ?? 0;
	} catch {
		return 0;
	}
}
