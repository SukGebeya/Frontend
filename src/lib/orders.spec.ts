import { describe, expect, it } from 'vitest';
import { autoConfirmAt } from './orders.js';

describe('autoConfirmAt', () => {
	it('is seven days after shipping', () => {
		expect(autoConfirmAt('2026-10-23T10:15:00Z')).toBe('2026-10-30T10:15:00.000Z');
	});

	it('is empty before the order ships', () => {
		expect(autoConfirmAt(undefined)).toBe('');
		expect(autoConfirmAt('not a date')).toBe('');
	});
});
