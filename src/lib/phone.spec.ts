import { describe, expect, it } from 'vitest';
import { PHONE_PATTERN, formatPhone, isEthiopianMobile } from './phone.js';

const valid = [
	'0911234567',
	'911234567',
	'+251911234567',
	'251911234567',
	'+251 91 123 4567',
	'0711 234 567'
];
const invalid = ['', '0811234567', '091123456', '+254911234567', '12345', '09112345678'];

describe('isEthiopianMobile', () => {
	it.each(valid)('accepts %s', (p) => expect(isEthiopianMobile(p)).toBe(true));
	it.each(invalid)('rejects %j', (p) => expect(isEthiopianMobile(p)).toBe(false));
});

describe('PHONE_PATTERN', () => {
	// Browsers anchor the pattern attribute with the v flag.
	const re = new RegExp(`^(?:${PHONE_PATTERN})$`, 'v');
	it.each(valid)('accepts %s', (p) => expect(re.test(p)).toBe(true));
	it.each(invalid)('rejects %j', (p) => expect(re.test(p)).toBe(false));
});

describe('formatPhone', () => {
	it('shows numbers in local form', () => {
		expect(formatPhone('+251911234567')).toBe('0911 234 567');
		expect(formatPhone('+251711234567')).toBe('0711 234 567');
	});
	it('leaves unknown input alone', () => {
		expect(formatPhone('12345')).toBe('12345');
		expect(formatPhone(undefined)).toBe('');
	});
});
