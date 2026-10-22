import { error, fail, redirect } from '@sveltejs/kit';
import type { User } from '#lib/api/types.js';

export type FieldErrors = Record<string, string>;

export interface Problem {
	status: number;
	message: string;
	code?: string;
	fields: FieldErrors;
}

interface ApiResult<T> {
	data?: T;
	error?: unknown;
	response: Response;
}

// Validation errors name Go struct fields (NewPassword); forms use JSON names (new_password).
export function snakeCase(field: string): string {
	return field
		.replace(/([a-z0-9])([A-Z])/g, '$1_$2')
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
		.toLowerCase();
}

/** Normalizes the API's two error shapes: `ErrorResponse` and a list of field errors. */
export function toProblem(status: number, body: unknown): Problem {
	if (Array.isArray(body)) {
		const fields: FieldErrors = {};
		for (const e of body) {
			if (e && typeof e.field === 'string') fields[snakeCase(e.field)] = String(e.message);
		}
		return { status, message: String(body[0]?.message ?? 'Please check the form.'), fields };
	}
	if (body && typeof body === 'object' && 'message' in body) {
		const { message, code } = body as { message: unknown; code?: unknown };
		return {
			status,
			message: String(message),
			code: typeof code === 'string' ? code : undefined,
			fields: {}
		};
	}
	return {
		status,
		message:
			status >= 500 ? 'Something went wrong. Please try again.' : `Request failed (${status}).`,
		fields: {}
	};
}

/** For loads: returns the data, or shows the error page. */
export function must<T>(result: ApiResult<T>): T {
	if (result.response.ok) return result.data as T;
	const p = toProblem(result.response.status, result.error);
	error(p.status, p.message);
}

export interface FormFailure {
	message: string;
	fields: FieldErrors;
	values: Record<string, string>;
}

/** For actions: a failure that keeps what the user typed (minus secrets) and per-field errors. */
export function failure(result: ApiResult<unknown>, form?: FormData) {
	const p = toProblem(result.response.status, result.error);
	return fail(p.status, { message: p.message, fields: p.fields, values: echo(form) });
}

export function invalid(message: string, form?: FormData, fields: FieldErrors = {}) {
	return fail(400, { message, fields, values: echo(form) });
}

function echo(form?: FormData): Record<string, string> {
	const values: Record<string, string> = {};
	for (const [k, v] of form?.entries() ?? []) {
		if (typeof v === 'string' && !k.includes('password')) values[k] = v;
	}
	return values;
}

/** Only same-site paths, so `?next=` cannot send people to another site. */
export function safeNext(next: string | null | undefined, fallback = '/'): string {
	return next && next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}

/** The signed-in user, or a redirect to log in (or an error page if the session could not be checked). */
export function requireUser(locals: App.Locals, url: URL): User {
	if (locals.user) return locals.user;
	if (locals.sessionError) error(locals.sessionError.status, locals.sessionError.message);
	redirect(303, `/login?next=${encodeURIComponent(url.pathname + url.search)}`);
}
