<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Field from '#lib/components/Field.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { t } from '#lib/i18n/index.js';
	import { PHONE_PATTERN } from '#lib/phone.js';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	const f = $derived(formState(form));
	const s = submitting();
	const next = $derived(page.url.searchParams.get('next') ?? '');
</script>

<svelte:head><title>{t('auth.registerTitle')} · Gebeya</title></svelte:head>

<section class="card stack narrow">
	<h1>{t('auth.registerTitle')}</h1>
	<FormMessage form={f} />
	<form method="POST" class="stack" use:enhance={s.submit}>
		<Field id="phone" label={t('auth.phone')} hint={t('auth.phoneHint')} error={f.fields?.phone}>
			<input
				id="phone"
				name="phone"
				type="tel"
				autocomplete="tel"
				inputmode="tel"
				pattern={PHONE_PATTERN}
				title={t('auth.invalidPhone')}
				required
				defaultValue={f.values?.phone ?? ''}
			/>
		</Field>
		<Field id="email" label={t('auth.email')} error={f.fields?.email}>
			<input
				id="email"
				name="email"
				type="email"
				autocomplete="email"
				defaultValue={f.values?.email ?? ''}
			/>
		</Field>
		<Field
			id="password"
			label={t('auth.password')}
			hint={t('auth.passwordHint')}
			error={f.fields?.password}
		>
			<input
				id="password"
				name="password"
				type="password"
				autocomplete="new-password"
				minlength="8"
				required
			/>
		</Field>
		<button class="btn primary block" disabled={s.busy}>{t('auth.register')}</button>
	</form>
	<p class="small muted">
		{t('auth.haveAccount')}
		<a href={resolve(`/login?next=${encodeURIComponent(next)}`)}>{t('auth.login')}</a>
	</p>
</section>

<style>
	.narrow {
		max-width: 26rem;
		margin: 0 auto;
	}
</style>
