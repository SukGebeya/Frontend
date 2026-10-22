<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Field from '#lib/components/Field.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { t } from '#lib/i18n/index.js';
	import { formatPhone } from '#lib/phone.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const f = $derived(formState(form));
	const verify = submitting();
	const resend = submitting();
	const codeSent = $derived(data.sent || f.notice === 'verify.sent');
</script>

<svelte:head><title>{t('verify.title')} · Gebeya</title></svelte:head>

<section class="card stack narrow">
	<h1>{t('verify.title')}</h1>
	<p class="muted">{t('verify.why')}</p>
	{#if codeSent}
		<p>{t('verify.lead', { phone: formatPhone(data.phone) })}</p>
	{/if}
	<FormMessage form={f} />

	{#if codeSent}
		<form method="POST" action="?/verify" class="stack" use:enhance={verify.submit}>
			<!-- `?/verify` replaces the query string, so where to go next travels in the form. -->
			<input type="hidden" name="next" value={page.url.searchParams.get('next') ?? ''} />
			<Field id="code" label={t('verify.code')} error={f.fields?.code}>
				<input
					id="code"
					name="code"
					inputmode="numeric"
					autocomplete="one-time-code"
					pattern={'[0-9]{6}'}
					maxlength="6"
					required
					class="code"
				/>
			</Field>
			<button class="btn primary block" disabled={verify.busy}>{t('verify.submit')}</button>
		</form>
	{/if}

	<form method="POST" action="?/send" use:enhance={resend.submit}>
		<button class="btn {codeSent ? 'link' : 'primary block'}" disabled={resend.busy}>
			{codeSent ? t('verify.resend') : t('reset.send')}
		</button>
	</form>
</section>

<style>
	.narrow {
		max-width: 26rem;
		margin: 0 auto;
	}
	.code {
		font-size: 1.4rem;
		letter-spacing: 0.4em;
		text-align: center;
	}
</style>
