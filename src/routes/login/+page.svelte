<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Alert from '#lib/components/Alert.svelte';
	import Field from '#lib/components/Field.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { t } from '#lib/i18n/index.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const f = $derived(formState(form));
	const s = submitting();
	const next = $derived(page.url.searchParams.get('next') ?? '');
</script>

<svelte:head><title>{t('auth.loginTitle')} · Gebeya</title></svelte:head>

<section class="card stack narrow">
	<h1>{t('auth.loginTitle')}</h1>
	{#if data.reset}<Alert tone="success">{t('reset.done')}</Alert>{/if}
	<FormMessage form={f} />
	<form method="POST" class="stack" use:enhance={s.submit}>
		<Field id="identifier" label={t('auth.identifier')}>
			<input
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
				id="password"
				name="password"
				type="password"
				autocomplete="current-password"
				required
			/>
		</Field>
		<button class="btn primary block" disabled={s.busy}>{t('auth.login')}</button>
	</form>
	<p class="small"><a href={resolve('/reset-password')}>{t('auth.forgot')}</a></p>
	<p class="small muted">
		{t('auth.noAccount')}
		<a href={resolve(`/register?next=${encodeURIComponent(next)}`)}>{t('auth.register')}</a>
	</p>
</section>

<style>
	.narrow {
		max-width: 26rem;
		margin: 0 auto;
	}
</style>
