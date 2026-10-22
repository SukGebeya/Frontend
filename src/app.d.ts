import type { Api } from '#lib/server/api.js';
import type { User } from '#lib/api/types.js';
import type { Lang } from '#lib/i18n/index.js';

declare global {
	namespace App {
		interface Locals {
			api: Api;
			user: User | null;
			/** Set when the session could not be checked (API down or rate limited), as opposed to logged out. */
			sessionError?: { status: number; message: string };
			lang: Lang;
		}
	}
}

export {};
