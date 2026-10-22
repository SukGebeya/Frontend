import { parseMoney } from '#lib/money.js';

export function text(form: FormData, key: string): string {
	return String(form.get(key) ?? '').trim();
}

export function optionalText(form: FormData, key: string): string | undefined {
	return text(form, key) || undefined;
}

/**
 * Reads a birr amount typed by a person. Returns `undefined` when empty and `null`
 * when it is not a valid amount, so callers can tell "missing" from "invalid".
 */
export function money(form: FormData, key: string): number | undefined | null {
	const raw = text(form, key);
	return raw === '' ? undefined : parseMoney(raw);
}

export function integer(form: FormData, key: string): number | null {
	const raw = text(form, key);
	return /^\d+$/.test(raw) ? Number(raw) : null;
}
