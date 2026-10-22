<script lang="ts">
	import { enhance } from '$app/forms';
	import Field from '#lib/components/Field.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { t } from '#lib/i18n/index.js';
	import { centsToInput } from '#lib/money.js';
	import { PHONE_PATTERN, formatPhone } from '#lib/phone.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const f = $derived(formState(form));
	const s = submitting();
	const p = $derived(data.profile);
	const v = (key: string, fallback: string) => f.values?.[key] ?? fallback;
</script>

<svelte:head><title>{t('seller.nav.settings')} · Gebeya</title></svelte:head>

<h1>{t('seller.nav.settings')}</h1>
<FormMessage form={f} />

<form method="POST" class="card stack" use:enhance={s.submit}>
	<Field id="shop_name" label={t('seller.shopName')} error={f.fields?.shop_name}>
		<input
			id="shop_name"
			name="shop_name"
			required
			minlength="2"
			maxlength="100"
			defaultValue={v('shop_name', p.shop_name)}
		/>
	</Field>
	<Field id="shop_description" label={t('seller.description')} error={f.fields?.shop_description}>
		<textarea
			id="shop_description"
			name="shop_description"
			maxlength="500"
			defaultValue={v('shop_description', p.shop_description ?? '')}></textarea>
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
				defaultValue={v('contact_phone', formatPhone(p.contact_phone))}
			/>
		</Field>
		<Field id="city" label={t('seller.city')} error={f.fields?.city}>
			<input id="city" name="city" required maxlength="100" defaultValue={v('city', p.city)} />
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
				defaultValue={v('delivery_fee', centsToInput(p.delivery_fee_cents))}
			/>
		</Field>
		<Field id="free_over" label={t('seller.freeOver')} error={f.fields?.free_over}>
			<input
				id="free_over"
				name="free_over"
				inputmode="decimal"
				defaultValue={v('free_over', centsToInput(p.free_delivery_threshold_cents))}
			/>
		</Field>
	</div>
	<button class="btn primary" disabled={s.busy}>{t('common.save')}</button>
</form>
