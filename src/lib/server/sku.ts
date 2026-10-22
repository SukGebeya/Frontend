import { randomBytes } from 'node:crypto';

/** Sellers rarely have stock codes; generate a unique one when they leave it empty. */
export function generateSku(): string {
	return `GB-${randomBytes(4).toString('hex').toUpperCase()}`;
}
