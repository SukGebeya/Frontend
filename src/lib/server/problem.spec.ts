import { describe, expect, it } from 'vitest';
import { safeNext, snakeCase, toProblem } from './problem.js';

describe('snakeCase', () => {
	it.each([
		['Phone', 'phone'],
		['NewPassword', 'new_password'],
		['DeliveryFeeCents', 'delivery_fee_cents'],
		['VariantID', 'variant_id'],
		['TIN', 'tin'],
		['SKU', 'sku']
	])('%s → %s', (go, json) => expect(snakeCase(go)).toBe(json));
});

describe('toProblem', () => {
	it('reads ErrorResponse bodies', () => {
		const p = toProblem(403, {
			error: 'Forbidden',
			code: 'FORBIDDEN',
			message: 'verify your phone number before opening a shop'
		});
		expect(p).toEqual({
			status: 403,
			code: 'FORBIDDEN',
			message: 'verify your phone number before opening a shop',
			fields: {}
		});
	});

	it('maps validation errors to form field names', () => {
		const p = toProblem(400, [
			{ field: 'Phone', message: 'Phone must be an Ethiopian mobile number' },
			{ field: 'NewPassword', message: 'NewPassword must be at least 8 characters' }
		]);
		expect(p.message).toBe('Phone must be an Ethiopian mobile number');
		expect(p.fields).toEqual({
			phone: 'Phone must be an Ethiopian mobile number',
			new_password: 'NewPassword must be at least 8 characters'
		});
	});

	it('hides details of unexpected bodies', () => {
		expect(toProblem(502, 'Bad Gateway').message).toBe('Something went wrong. Please try again.');
	});
});

describe('safeNext', () => {
	it('keeps same-site paths only', () => {
		expect(safeNext('/checkout?x=1')).toBe('/checkout?x=1');
		expect(safeNext('//evil.example')).toBe('/');
		expect(safeNext('https://evil.example')).toBe('/');
		expect(safeNext(null, '/orders')).toBe('/orders');
	});
});
