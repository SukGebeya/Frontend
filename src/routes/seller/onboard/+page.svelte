<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import Alert from '#lib/components/Alert.svelte';
	import Field from '#lib/components/Field.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { t } from '#lib/i18n/index.js';
	import { PHONE_PATTERN, formatPhone } from '#lib/phone.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const f = $derived(formState(form));
	const s = submitting();
	const v = (key: string, fallback = '') => f.values?.[key] ?? fallback;
</script>

<svelte:head><title>{t('seller.onboardTitle')} · Gebeya</title></svelte:head>

<section class="stack">
	<header class="stack-sm">
		<h1>{t('seller.onboardTitle')}</h1>
		<p class="muted">{t('seller.onboardLead')}</p>
	</header>

	{#if !data.phoneVerified}
		<Alert tone="warn">
			{t('seller.verifyFirst')}
			<a href={resolve('/verify-phone?next=/seller/onboard')}>{t('checkout.verifyNow')}</a>
		</Alert>
	{/if}
	<FormMessage form={f} />

	<form method="POST" class="card stack" use:enhance={s.submit}>
		<Field id="shop_name" label={t('seller.shopName')} error={f.fields?.shop_name}>
			<input
				id="shop_name"
				name="shop_name"
				required
				minlength="2"
				maxlength="100"
				defaultValue={v('shop_name')}
			/>
		</Field>
		<Field
			id="shop_slug"
			label={t('seller.shopSlug')}
			hint={t('seller.shopSlugHint')}
			error={f.fields?.shop_slug}
		>
			<input
				id="shop_slug"
				name="shop_slug"
				pattern="[a-z0-9]+(-[a-z0-9]+)*"
				minlength="2"
				maxlength="100"
				defaultValue={v('shop_slug')}
			/>
		</Field>
		<Field id="shop_description" label={t('seller.description')} error={f.fields?.shop_description}>
			<textarea
				id="shop_description"
				name="shop_description"
				maxlength="500"
				defaultValue={v('shop_description')}></textarea>
		</Field>
		<div class="grid-2">
			<Field id="contact_phone" label={t('seller.contactPhone')} error={f.fields?.contact_phone}>
				<input
					id="contact_phone"
					name="contact_phone"
					type="tel"
					pattern={PHONE_PATTERN}
					title={t('auth.invalidPhone')}
					required
					defaultValue={v('contact_phone', formatPhone(data.phone))}
				/>
			</Field>
			<Field id="city" label={t('seller.city')} error={f.fields?.city}>
				<input
					id="city"
					name="city"
					required
					maxlength="100"
					defaultValue={v('city', 'Addis Ababa')}
				/>
			</Field>
		</div>
		<div class="grid-2">
			<Field
				id="delivery_fee"
				label={t('seller.deliveryFee')}
				error={f.fields?.delivery_fee ?? f.fields?.delivery_fee_cents}
			>
				<input
					id="delivery_fee"
					name="delivery_fee"
					inputmode="decimal"
					required
					defaultValue={v('delivery_fee', '0')}
				/>
			</Field>
			<Field id="free_over" label={t('seller.freeOver')} error={f.fields?.free_over}>
				<input id="free_over" name="free_over" inputmode="decimal" defaultValue={v('free_over')} />
			</Field>
		</div>
		<Field id="tin" label={t('seller.tin')} error={f.fields?.tin}>
			<input
				id="tin"
				name="tin"
				inputmode="numeric"
				pattern={'[0-9]{10}'}
				maxlength="10"
				defaultValue={v('tin')}
			/>
		</Field>
		<button class="btn primary block" disabled={s.busy || !data.phoneVerified}
			>{t('seller.open')}</button
		>
	</form>
</section>
