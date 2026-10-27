import type { Address } from '#lib/api/types.js';

/** "Bole, near Edna Mall, house 12 · Woreda 03, Bole, Addis Ababa" */
export function formatAddress(a: Address, woreda: string): string {
	const street = [a.line1, a.line2].filter(Boolean).join(', ');
	const area = [a.woreda && `${woreda} ${a.woreda}`, a.subcity, a.city].filter(Boolean).join(', ');
	return [street, area].filter(Boolean).join(' · ');
}
