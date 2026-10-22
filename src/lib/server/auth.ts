import type { Cookies } from '@sveltejs/kit';
import type { Tokens } from '#lib/api/types.js';
import type { Api } from './api.js';
import { CART_SESSION, storeTokens } from './cookies.js';

/** Stores the session and moves anything added to the cart as a guest into the account cart. */
export async function signIn(api: Api, cookies: Cookies, tokens: Tokens) {
	storeTokens(cookies, tokens);
	const session = cookies.get(CART_SESSION);
	if (!session) return;
	const { response } = await api.POST('/cart/merge', {
		params: { header: { 'X-Session-ID': session } }
	});
	// A failed merge only loses guest cart lines; the sign-in itself succeeded.
	if (!response.ok) console.warn('cart merge failed', response.status);
}
