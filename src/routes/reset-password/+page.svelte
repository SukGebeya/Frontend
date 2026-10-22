<script lang="ts">
	import { enhance } from '$app/forms';
	import Field from '#lib/components/Field.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { t } from '#lib/i18n/index.js';
	import { PHONE_PATTERN } from '#lib/phone.js';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	const f = $derived(formState(form));
	const s = submitting();
	// The second step appears once a code was requested (or when its submission failed).
	const codeStep = $derived(f.notice === 'reset.sent' || f.values?.code !== undefined);
</script>

<svelte:head><title>{t('reset.title')} · Gebeya</title></svelte:head>

<section class="card stack narrow">
	<h1>{t('reset.title')}</h1>
	<FormMessage form={f} />
	{#if !codeStep}
		<p class="muted">{t('reset.lead')}</p>
		<form method="POST" action="?/request" class="stack" use:enhance={s.submit}>
			<Field id="phone" label={t('auth.phone')} hint={t('auth.phoneHint')} error={f.fields?.phone}>
				<input
					id="phone"
					name="phone"
					type="tel"
					inputmode="tel"
					pattern={PHONE_PATTERN}
					required
					defaultValue={f.values?.phone ?? ''}
				/>
			</Field>
			<button class="btn primary block" disabled={s.busy}>{t('reset.send')}</button>
		</form>
	{:else}
		<form method="POST" action="?/confirm" class="stack" use:enhance={s.submit}>
			<input type="hidden" name="phone" value={f.values?.phone ?? ''} />
			<Field id="code" label={t('reset.code')} error={f.fields?.code}>
				<input
					id="code"
					name="code"
					inputmode="numeric"
					autocomplete="one-time-code"
					pattern={'[0-9]{6}'}
					maxlength="6"
					required
				/>
			</Field>
			<Field
				id="new_password"
				label={t('reset.newPassword')}
				hint={t('auth.passwordHint')}
				error={f.fields?.new_password}
			>
				<input
					id="new_password"
					name="new_password"
					type="password"
					autocomplete="new-password"
					minlength="8"
					required
				/>
			</Field>
			<button class="btn primary block" disabled={s.busy}>{t('reset.submit')}</button>
		</form>
	{/if}
</section>

<style>
	.narrow {
		max-width: 26rem;
		margin: 0 auto;
	}
</style>
