// The API confirms delivery on its own this many days after shipping (AUTO_CONFIRM_DELIVERY_DAYS).
export const AUTO_CONFIRM_DAYS = 7;

/** When a shipped order confirms itself, as an ISO timestamp; '' if it hasn't shipped. */
export function autoConfirmAt(shippedAt: string | undefined | null): string {
	const shipped = shippedAt ? Date.parse(shippedAt) : NaN;
	if (Number.isNaN(shipped)) return '';
	return new Date(shipped + AUTO_CONFIRM_DAYS * 24 * 60 * 60 * 1000).toISOString();
}
