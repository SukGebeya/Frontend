<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Alert from '#lib/components/Alert.svelte';
	import Field from '#lib/components/Field.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Submit from '#lib/components/Submit.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { t, tSplit } from '#lib/i18n/index.js';
	import { formatPhone } from '#lib/phone.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const f = $derived(formState(form));
	const verify = submitting();
	const resend = submitting();
	const codeSent = $derived(data.sent || f.notice === 'verify.sent');
	const phone = $derived(formatPhone(data.phone));
	const [before, after] = $derived(tSplit('verify.lead', 'phone'));
</script>

<svelte:head><title>{t('verify.title')} · {t('brand.name')}</title></svelte:head>

<div class="narrow auth">
	<div class="auth-head">
		<span class="trust-i lg" aria-hidden="true"><Icon name="mobile" size={26} /></span>
		<h1 class="t1">{t('verify.title')}</h1>
		<p class="body muted pretty">{t('verify.why')}</p>
	</div>

	{#if !codeSent}
		<p class="callout pretty center">
			{t('verify.willSend')} <span class="num strong">{phone}</span>
		</p>
	{:else if !f.message}
		<Alert tone="success"><span>{before}<strong class="num">{phone}</strong>{after}</span></Alert>
	{/if}
	{#if f.message}<FormMessage form={f} />{/if}

	{#if codeSent}
		<form method="POST" action="?/verify" class="form" use:enhance={verify.submit}>
			<!-- `?/verify` replaces the query string, so where to go next travels in the form. -->
			<input type="hidden" name="next" value={page.url.searchParams.get('next') ?? ''} />
			<Field id="code" label={t('verify.code')} hint={t('verify.expires')} error={f.fields?.code}>
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
			<Submit busy={verify.busy} class="btn-primary btn-block">{t('verify.submit')}</Submit>
		</form>
	{/if}

	<form method="POST" action="?/send" class="hstack" use:enhance={resend.submit}>
		<Submit busy={resend.busy} class="{codeSent ? 'btn-secondary' : 'btn-primary'} btn-block">
			{codeSent ? t('verify.resend') : t('reset.send')}
		</Submit>
	</form>
</div>

<style>
	.trust-i.lg {
		width: 56px;
		height: 56px;
	}
</style>
