<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Alert from '#lib/components/Alert.svelte';
	import Field from '#lib/components/Field.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import Submit from '#lib/components/Submit.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { t } from '#lib/i18n/index.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const f = $derived(formState(form));
	const s = submitting();
	const next = $derived(page.url.searchParams.get('next') ?? '');
</script>

<svelte:head><title>{t('auth.loginTitle')} · {t('brand.name')}</title></svelte:head>

<div class="narrow auth">
	<div class="auth-head">
		<span class="logo-m lg" aria-hidden="true">ገ</span>
		<h1 class="t1">{t('auth.loginTitle')}</h1>
		<p class="body muted">{t('auth.welcome')}</p>
	</div>

	{#if data.reset && !f.message}
		<Alert tone="success" title={t('reset.doneTitle')}><span>{t('reset.done')}</span></Alert>
	{/if}
	<FormMessage form={f} />

	<form method="POST" class="form" use:enhance={s.submit}>
		<Field id="identifier" label={t('auth.identifier')}>
			<input
				class="input"
				id="identifier"
				name="identifier"
				autocomplete="username"
				inputmode="email"
				required
				defaultValue={f.values?.identifier ?? ''}
			/>
		</Field>
		<Field id="password" label={t('auth.password')}>
			<input
				class="input"
				id="password"
				name="password"
				type="password"
				autocomplete="current-password"
				required
			/>
			<a class="btn btn-link btn-sm forgot" href={resolve('/reset-password')}>{t('auth.forgot')}</a>
		</Field>
		<Submit busy={s.busy} class="btn-primary btn-block">{t('auth.login')}</Submit>
	</form>

	<p class="sub muted center">
		{t('auth.noAccount')}
		<a class="strong" href={resolve(`/register?next=${encodeURIComponent(next)}`)}
			>{t('auth.register')}</a
		>
	</p>
</div>

<style>
	.forgot {
		align-self: flex-end;
		padding: 0;
	}
</style>
