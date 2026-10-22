import type { Cookies } from '@sveltejs/kit';
import type { Tokens } from '#lib/api/types.js';

export const ACCESS = 'gb_access';
export const REFRESH = 'gb_refresh';
export const CART_SESSION = 'gb_cart';
export const LANG = 'gb_lang';
export const PENDING_ORDER = 'gb_pending_order';

const DAY = 24 * 60 * 60;
// Matches the API's JWT_REFRESH_TTL and guest cart session lifetime.
const REFRESH_MAX_AGE = 7 * DAY;

const base = { path: '/', httpOnly: true, sameSite: 'lax' } as const;

export function storeTokens(cookies: Cookies, tokens: Tokens) {
	// Expire the access cookie a little early so a request never carries a token that dies in flight.
	cookies.set(ACCESS, tokens.access_token, {
		...base,
		maxAge: Math.max(tokens.expires_in - 30, 30)
	});
	cookies.set(REFRESH, tokens.refresh_token, { ...base, maxAge: REFRESH_MAX_AGE });
}

export function clearTokens(cookies: Cookies) {
	cookies.delete(ACCESS, base);
	cookies.delete(REFRESH, base);
}

export function storeCartSession(cookies: Cookies, id: string) {
	cookies.set(CART_SESSION, id, { ...base, maxAge: REFRESH_MAX_AGE });
}

export function storePendingOrder(cookies: Cookies, orderId: string) {
	cookies.set(PENDING_ORDER, orderId, { ...base, maxAge: DAY });
}

export function setLang(cookies: Cookies, lang: string) {
	cookies.set(LANG, lang, { ...base, httpOnly: false, maxAge: 365 * DAY });
}
