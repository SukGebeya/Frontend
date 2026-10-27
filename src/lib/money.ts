// Money is integer santim (1 ETB = 100) end to end, as in the API. Never use floats for amounts.

const MAX_CENTS = 1_000_000_000_00; // 1 billion birr, far above any order or payout

function group(whole: string): string {
	return whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** 1234500 → "12,345.00" */
export function formatAmount(cents: number): string {
	const sign = cents < 0 ? '-' : '';
	const abs = Math.abs(Math.trunc(cents));
	const whole = Math.floor(abs / 100).toString();
	const frac = (abs % 100).toString().padStart(2, '0');
	return `${sign}${group(whole)}.${frac}`;
}

/** "ETB", or "ብር" in Amharic */
export function currency(lang: string = 'en'): string {
	return lang === 'am' ? 'ብር' : 'ETB';
}

/** 1234500 → "12,345.00 ETB" (or "ብር" in Amharic) */
export function formatMoney(cents: number, lang: string = 'en'): string {
	return `${formatAmount(cents)} ${currency(lang)}`;
}

/**
 * Parses what a person types as birr ("2,500", "2500.5", "1 200.75") into santim.
 * Returns null for anything that is not a non-negative amount with at most two decimals.
 */
export function parseMoney(input: string): number | null {
	const cleaned = input.replace(/[\s,]/g, '');
	const m = cleaned.match(/^(\d+)(?:\.(\d{0,2}))?$/);
	if (!m) return null;
	const cents = Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0'));
	return Number.isSafeInteger(cents) && cents <= MAX_CENTS ? cents : null;
}

/** 250000 → "2500" for prefilling an input; keeps decimals only when there are santim. */
export function centsToInput(cents: number | undefined | null): string {
	if (cents == null) return '';
	return cents % 100 === 0 ? String(cents / 100) : formatAmount(cents).replace(/,/g, '');
}
