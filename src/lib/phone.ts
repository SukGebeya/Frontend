// The API normalizes every Ethiopian format (0911…, 911…, +251 911…, 251911…) to +2519…/+2517….
// The client only checks the shape so people get feedback before submitting.

const MOBILE = /^(?:\+?251|0)?([79]\d{8})$/;

function strip(input: string): string {
	return input.replace(/[\s\-().]/g, '');
}

export function isEthiopianMobile(input: string): boolean {
	return MOBILE.test(strip(input));
}

/** "+251911234567" → "0911 234 567"; anything else is returned unchanged. */
export function formatPhone(input: string | undefined | null): string {
	if (!input) return '';
	const m = strip(input).match(MOBILE);
	if (!m) return input;
	const local = `0${m[1]}`;
	return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

/** HTML pattern attribute equivalent of isEthiopianMobile, tolerant of spaces. */
export const PHONE_PATTERN =
	'[\\s\\-\\(\\)\\.]*(\\+?[\\s]*2[\\s]*5[\\s]*1|0)?[\\s\\-]*[79]([\\s\\-]*[0-9]){8}[\\s]*';
