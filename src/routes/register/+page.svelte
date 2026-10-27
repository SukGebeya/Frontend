<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
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
	const next = $derived(page.url.searchParams.get('next') ?? '');
</script>

<svelte:head><title>{t('auth.registerTitle')} · {t('brand.name')}</title></svelte:head>

<div class="narrow auth">
	<div class="auth-head">
		<span class="logo-m lg" aria-hidden="true">ገ</span>
		<h1 class="t1">{t('auth.registerTitle')}</h1>
		<p class="body muted pretty">{t('auth.registerLead')}</p>
	</div>

	<FormMessage form={f} />

	<form method="POST" class="form" use:enhance={s.submit}>
		<Field id="phone" label={t('auth.phone')} hint={t('auth.phoneHint')} error={f.fields?.phone}>
			<input
				class="input num"
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
		<Field id="email" label={t('auth.email')} optional error={f.fields?.email}>
			<input
				class="input"
				id="email"
				name="email"
				type="email"
				autocomplete="email"
				placeholder="you@example.com"
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
				class="input"
				id="password"
				name="password"
				type="password"
				autocomplete="new-password"
				minlength="8"
				required
			/>
		</Field>
		<Submit busy={s.busy} class="btn-primary btn-block">{t('auth.register')}</Submit>
	</form>

	<p class="sub muted center">
		{t('auth.haveAccount')}
		<a class="strong" href={resolve(`/login?next=${encodeURIComponent(next)}`)}>{t('auth.login')}</a
		>
	</p>
</div>
