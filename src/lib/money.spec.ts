import { describe, expect, it } from 'vitest';
import { centsToInput, formatAmount, formatMoney, parseMoney } from './money.js';

describe('formatAmount', () => {
	it.each([
		[0, '0.00'],
		[5, '0.05'],
		[250000, '2,500.00'],
		[515000, '5,150.00'],
		[18025, '180.25'],
		[123456789, '1,234,567.89'],
		[-6975, '-69.75']
	])('%i → %s', (cents, text) => {
		expect(formatAmount(cents)).toBe(text);
	});

	it('labels the currency per language', () => {
		expect(formatMoney(15000)).toBe('150.00 ETB');
		expect(formatMoney(15000, 'am')).toBe('150.00 ብር');
	});
});

describe('parseMoney', () => {
	it.each([
		['2500', 250000],
		['2,500', 250000],
		['1 200.75', 120075],
		['0.5', 50],
		['10.', 1000],
		['0', 0]
	])('%s → %i santim', (text, cents) => {
		expect(parseMoney(text)).toBe(cents);
	});

	it.each(['', '-5', '1.234', 'abc', '1e5', '12.3.4', '99999999999999'])('rejects %j', (text) => {
		expect(parseMoney(text)).toBeNull();
	});

	it('round-trips with centsToInput', () => {
		for (const cents of [0, 1, 99, 15000, 120075]) {
			expect(parseMoney(centsToInput(cents))).toBe(cents);
		}
	});
});
