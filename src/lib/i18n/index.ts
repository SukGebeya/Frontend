import { page } from '$app/state';
import am from './am.js';
import en from './en.js';

export type Lang = 'en' | 'am';
export type Key = keyof typeof en;
export type Vars = Record<string, string | number>;

const dictionaries: Record<Lang, Record<Key, string>> = { en, am };

export function isLang(value: unknown): value is Lang {
	return value === 'en' || value === 'am';
}

export function translate(lang: Lang, key: Key, vars?: Vars): string {
	const text = dictionaries[lang][key] ?? en[key];
	return vars ? text.replace(/\{(\w+)\}/g, (m, name) => String(vars[name] ?? m)) : text;
}

/** The current page's language, from the root layout data. */
export function lang(): Lang {
	const value = page.data?.lang;
	return isLang(value) ? value : 'en';
}

/** Translates in the current page's language. Call it from component markup or scripts. */
export function t(key: Key, vars?: Vars): string {
	return translate(lang(), key, vars);
}

/** Splits a translation around one placeholder, so markup can wrap that value: `[before, after]`. */
export function tSplit(key: Key, name: string, vars?: Vars): [string, string] {
	const [before, after = ''] = t(key, { ...vars, [name]: '\u0000' }).split('\u0000');
	return [before, after];
}

/** Keys built from API values (statuses, methods); falls back to the raw value if unknown. */
export function tv(prefix: string, value: string): string {
	const key = `${prefix}.${value}`;
	return key in en ? t(key as Key) : value;
}

export function formatDate(iso: string | undefined | null, withTime = false): string {
	if (!iso) return '';
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	return new Intl.DateTimeFormat(lang() === 'am' ? 'am-ET' : 'en-GB', {
		dateStyle: 'medium',
		timeStyle: withTime ? 'short' : undefined,
		timeZone: 'Africa/Addis_Ababa'
	}).format(date);
}
