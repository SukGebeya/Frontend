<script lang="ts">
	import { enhance } from '$app/forms';
	import Field from '#lib/components/Field.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import Submit from '#lib/components/Submit.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { lang, t } from '#lib/i18n/index.js';
	import { centsToInput, currency } from '#lib/money.js';
	import { PHONE_PATTERN, formatPhone } from '#lib/phone.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const f = $derived(formState(form));
	const s = submitting();
	const p = $derived(data.profile);
	const v = (key: string, fallback: string) => f.values?.[key] ?? fallback;
</script>

<svelte:head><title>{t('seller.nav.settings')} · {t('brand.name')}</title></svelte:head>

<h1 class="t1">{t('seller.nav.settings')}</h1>
<FormMessage form={f} />

<form method="POST" class="split half" use:enhance={s.submit}>
	<section class="card" aria-labelledby="shop-h">
		<h2 class="card-t" id="shop-h">{t('seller.shopSection')}</h2>
		<Field id="shop_name" label={t('seller.shopName')} error={f.fields?.shop_name}>
			<input
				class="input"
				id="shop_name"
				name="shop_name"
				required
				minlength="2"
				maxlength="100"
				defaultValue={v('shop_name', p.shop_name)}
			/>
		</Field>
		<Field
			id="shop_description"
			label={t('seller.description')}
			optional
			error={f.fields?.shop_description}
		>
			<textarea
				class="input"
				id="shop_description"
				name="shop_description"
				maxlength="500"
				placeholder={t('seller.descriptionPlaceholder')}
				defaultValue={v('shop_description', p.shop_description ?? '')}></textarea>
		</Field>
		<Field id="contact_phone" label={t('seller.contactPhone')} error={f.fields?.contact_phone}>
			<input
				class="input num"
				id="contact_phone"
				name="contact_phone"
				type="tel"
				inputmode="tel"
				pattern={PHONE_PATTERN}
				title={t('auth.invalidPhone')}
				required
				defaultValue={v('contact_phone', formatPhone(p.contact_phone))}
			/>
		</Field>
		<Field id="city" label={t('seller.city')} error={f.fields?.city}>
			<input
				class="input"
				id="city"
				name="city"
				required
				maxlength="100"
				defaultValue={v('city', p.city)}
			/>
		</Field>
	</section>

	<div class="vstack">
		<section class="card" aria-labelledby="del-h">
			<div class="vstack gap-4">
				<h2 class="card-t" id="del-h">{t('product.delivery')}</h2>
				<p class="foot muted">{t('seller.deliveryNote')}</p>
			</div>
			<Field
				id="delivery_fee"
				label={t('seller.deliveryFee')}
				suffix={currency(lang())}
				error={f.fields?.delivery_fee ?? f.fields?.delivery_fee_cents}
			>
				<input
					class="input num"
					id="delivery_fee"
					name="delivery_fee"
					inputmode="decimal"
					required
					defaultValue={v('delivery_fee', centsToInput(p.delivery_fee_cents))}
				/>
			</Field>
			<Field
				id="free_over"
				label={t('seller.freeOver')}
				optional
				suffix={currency(lang())}
				hint={t('seller.freeOverRemove')}
				error={f.fields?.free_over}
			>
				<input
					class="input num"
					id="free_over"
					name="free_over"
					inputmode="decimal"
					defaultValue={v('free_over', centsToInput(p.free_delivery_threshold_cents))}
				/>
			</Field>
		</section>
		<Submit busy={s.busy} class="btn-primary btn-block">{t('common.save')}</Submit>
	</div>
</form>

<style>
	.split.half {
		gap: 16px;
	}
	.split .card {
		gap: 18px;
	}
</style>
