import type { SubmitFunction } from '$app/forms';
import type { Key } from '#lib/i18n/index.js';

/** The shape every action in this app returns, on failure or success. */
export interface FormState {
	message?: string;
	fields?: Record<string, string>;
	values?: Record<string, string>;
	notice?: Key;
}

export function formState(form: unknown): FormState {
	return (form ?? {}) as FormState;
}

/**
 * Tracks one form's submission so its button can show progress and block double submits.
 *
 * Inputs use `defaultValue` so typing before hydration is never overwritten. That makes
 * resetting after success wrong for forms that show saved data (it would restore the old
 * defaults), so only forms that add something new should pass `reset: true`.
 */
export function submitting({ reset = false } = {}) {
	let busy = $state(false);
	const submit: SubmitFunction = () => {
		busy = true;
		return async ({ update }) => {
			try {
				await update({ reset });
			} finally {
				busy = false;
			}
		};
	};
	return {
		get busy() {
			return busy;
		},
		submit
	};
}

/** Asks before submitting. `use:enhance` ignores preventDefault, so this cancels through its API. */
export function confirmFirst(message: () => string, inner: SubmitFunction): SubmitFunction {
	return (input) => {
		if (!confirm(message())) {
			input.cancel();
			return;
		}
		return inner(input);
	};
}
