import { describe, expect, it } from 'vitest';
import am from './am.js';
import en from './en.js';
import { translate } from './index.js';

describe('dictionaries', () => {
	it('have the same keys and no empty strings', () => {
		expect(Object.keys(am).sort()).toEqual(Object.keys(en).sort());
		for (const [key, text] of Object.entries(am)) expect(text, key).not.toBe('');
	});

	it('use the same placeholders in both languages', () => {
		const vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
		for (const key of Object.keys(en) as (keyof typeof en)[]) {
			expect(vars(am[key]), key).toEqual(vars(en[key]));
		}
	});
});

describe('translate', () => {
	it('fills placeholders', () => {
		expect(translate('en', 'product.left', { n: 3 })).toBe('3 left');
		expect(translate('am', 'product.left', { n: 3 })).toBe('3 ቀርቷል');
	});
});
