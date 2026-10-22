import type { Handle, HandleServerError } from '@sveltejs/kit/hooks';
import { isLang } from '#lib/i18n/index.js';
import { createApi } from '#lib/server/api.js';
import { ACCESS, LANG, REFRESH } from '#lib/server/cookies.js';
import { toProblem } from '#lib/server/problem.js';

export const handle: Handle = async ({ event, resolve }) => {
	const lang = event.cookies.get(LANG);
	event.locals.lang = isLang(lang) ? lang : 'en';
	event.locals.api = createApi(event);
	event.locals.user = null;

	if (event.cookies.get(ACCESS) || event.cookies.get(REFRESH)) {
		const { data, error, response } = await event.locals.api.GET('/users/me');
		event.locals.user = data ?? null;
		// Only a 401 means signed out; anything else must not send people to the login page.
		if (!data && response.status !== 401) {
			event.locals.sessionError = toProblem(response.status, error);
		}
	}

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', event.locals.lang)
	});
};

// App and framework errors (404s, API errors passed through `error()`) keep their own status and message.
export const handleError: HandleServerError = ({ kind, error, event }) => {
	if (kind === 'unknown') {
		console.error('Unhandled error', event.url.pathname, error);
		return { message: 'Something went wrong. Please try again.' };
	}
};
