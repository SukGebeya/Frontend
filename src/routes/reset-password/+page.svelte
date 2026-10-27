<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import Alert from '#lib/components/Alert.svelte';
	import Field from '#lib/components/Field.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import Submit from '#lib/components/Submit.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { t } from '#lib/i18n/index.js';
	import { PHONE_PATTERN } from '#lib/phone.js';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	const f = $derived(formState(form));
	const s = submitting();
	const again = submitting();
	// The second step appears once a code was requested (or when its submission failed).
	const codeStep = $derived(f.notice === 'reset.sent' || f.values?.code !== undefined);
</script>

<svelte:head><title>{t('reset.title')} · {t('brand.name')}</title></svelte:head>

<div class="narrow auth">
	<div class="auth-head">
		<span class="logo-m lg" aria-hidden="true">ገ</span>
		<p class="eyebrow">{t('reset.step', { n: codeStep ? 2 : 1 })}</p>
		<h1 class="t1">{codeStep ? t('reset.setTitle') : t('reset.title')}</h1>
		{#if !codeStep}<p class="body muted pretty">{t('reset.lead')}</p>{/if}
	</div>

	{#if f.message}
		<FormMessage form={f} />
	{:else if codeStep}
		<Alert tone="info"><span>{t('reset.sent')}</span></Alert>
	{/if}

	{#if !codeStep}
		<form method="POST" action="?/request" class="form" use:enhance={s.submit}>
			<Field id="phone" label={t('auth.phone')} hint={t('auth.phoneHint')} error={f.fields?.phone}>
				<input
					class="input num"
					id="phone"
					name="phone"
					type="tel"
					inputmode="tel"
					autocomplete="tel"
					pattern={PHONE_PATTERN}
					required
					defaultValue={f.values?.phone ?? ''}
				/>
			</Field>
			<Submit busy={s.busy} class="btn-primary btn-block">{t('reset.send')}</Submit>
		</form>
		<p class="sub muted center">
			{t('reset.remembered')}
			<a class="strong" href={resolve('/login')}>{t('auth.login')}</a>
		</p>
	{:else}
		<form method="POST" action="?/confirm" class="form" use:enhance={s.submit}>
			<input type="hidden" name="phone" value={f.values?.phone ?? ''} />
			<Field id="code" label={t('reset.code')} error={f.fields?.code}>
				<input
					class="input otp"
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
					class="input"
					id="new_password"
					name="new_password"
					type="password"
					autocomplete="new-password"
					minlength="8"
					required
				/>
			</Field>
			<Submit busy={s.busy} class="btn-primary btn-block">{t('reset.submit')}</Submit>
		</form>
		<form method="POST" action="?/request" class="hstack again" use:enhance={again.submit}>
			<input type="hidden" name="phone" value={f.values?.phone ?? ''} />
			<span class="sub muted">{t('reset.noCode')}</span>
			<Submit busy={again.busy} class="btn-link btn-sm">{t('verify.resend')}</Submit>
		</form>
	{/if}
</div>

<style>
	.again {
		justify-content: center;
		gap: 4px;
	}
	.again :global(.btn) {
		padding: 0 4px;
	}
</style>
