import createClient from 'openapi-fetch';
import { error, type RequestEvent } from '@sveltejs/kit';
import { API_URL } from '$app/env/private';
import type { paths } from '#lib/api/schema.js';
import {
	ACCESS,
	CART_SESSION,
	REFRESH,
	clearTokens,
	storeCartSession,
	storeTokens
} from './cookies.js';

const apiPath = new URL(API_URL).pathname;

// A 401 from these means wrong credentials or a dead refresh token, not an expired access token.
const NO_REFRESH = new Set(['/login', '/register', '/refresh', '/logout']);

type ApiEvent = Pick<RequestEvent, 'cookies' | 'getClientAddress'>;

/**
 * A typed client for the Go API, scoped to one incoming request. It attaches the
 * access token and guest cart session from httpOnly cookies, refreshes the access
 * token once when it has expired, and stores rotated tokens back into cookies.
 */
export function createApi(event: ApiEvent) {
	const { cookies } = event;
	let refreshing: Promise<boolean> | undefined;

	const clientIp = () => {
		try {
			return event.getClientAddress();
		} catch {
			return undefined;
		}
	};

	// Refresh tokens rotate, so parallel calls in one request must share a single refresh.
	function refresh(): Promise<boolean> {
		refreshing ??= (async () => {
			const token = cookies.get(REFRESH);
			if (!token) return false;
			const res = await fetch(`${API_URL}/refresh`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ refresh_token: token })
			});
			if (!res.ok) {
				clearTokens(cookies);
				return false;
			}
			storeTokens(cookies, await res.json());
			return true;
		})();
		return refreshing;
	}

	async function send(request: Request): Promise<Response> {
		const path = new URL(request.url).pathname.slice(apiPath.length);
		const canRefresh = !NO_REFRESH.has(path);
		const body = request.body ? await request.arrayBuffer() : undefined;

		const attempt = () => {
			const headers = new Headers(request.headers);
			const access = cookies.get(ACCESS);
			if (access) headers.set('Authorization', `Bearer ${access}`);
			const cart = cookies.get(CART_SESSION);
			if (cart) headers.set('X-Session-ID', cart);
			const ip = clientIp();
			if (ip) headers.set('X-Forwarded-For', ip);
			return fetch(request.url, { method: request.method, headers, body });
		};

		try {
			if (canRefresh && !cookies.get(ACCESS) && cookies.get(REFRESH)) await refresh();
			let res = await attempt();
			if (res.status === 401 && canRefresh && cookies.get(REFRESH) && (await refresh())) {
				res = await attempt();
			}
			const session = res.headers.get('X-Session-ID');
			if (session && session !== cookies.get(CART_SESSION)) storeCartSession(cookies, session);
			return res;
		} catch (e) {
			console.error('API request failed', request.method, path, e);
			error(503, 'Gebeya is unavailable right now. Please try again in a moment.');
		}
	}

	return createClient<paths>({ baseUrl: API_URL, fetch: send });
}

export type Api = ReturnType<typeof createApi>;
