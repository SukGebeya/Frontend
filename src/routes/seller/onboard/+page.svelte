<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Alert from '#lib/components/Alert.svelte';
	import Field from '#lib/components/Field.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import Submit from '#lib/components/Submit.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { lang, t } from '#lib/i18n/index.js';
	import { currency } from '#lib/money.js';
	import { PHONE_PATTERN, formatPhone } from '#lib/phone.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const f = $derived(formState(form));
	const s = submitting();
	const v = (key: string, fallback = '') => f.values?.[key] ?? fallback;
</script>

<svelte:head><title>{t('seller.onboardTitle')} · {t('brand.name')}</title></svelte:head>

<div class="narrow vstack onboard">
	<div class="vstack gap-8">
		<p class="eyebrow">{t('seller.eyebrow')}</p>
		<h1 class="t1">{t('seller.onboardTitle')}</h1>
		<p class="body muted pretty">{t('seller.onboardLead')}</p>
	</div>

	{#if !data.phoneVerified}
		<Alert tone="warning" title={t('seller.verifyTitle')}>
			<span>{t('seller.verifyFirst')}</span>
			<a class="btn btn-primary btn-sm" href={resolve('/verify-phone?next=/seller/onboard')}
				>{t('checkout.verifyNow')}</a
			>
		</Alert>
	{/if}
	<FormMessage form={f} />

	<form method="POST" class="form" use:enhance={s.submit}>
		<fieldset class="form" disabled={!data.phoneVerified}>
			<Field id="shop_name" label={t('seller.shopName')} error={f.fields?.shop_name}>
				<input
					class="input"
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
				optional
				hint={t('seller.shopSlugHint')}
				error={f.fields?.shop_slug}
			>
				<div class="group">
					<span class="group-pre" aria-hidden="true">{page.url.host}/s/</span>
					<input
						class="input"
						id="shop_slug"
						name="shop_slug"
						pattern="[a-z0-9]+(-[a-z0-9]+)*"
						minlength="2"
						maxlength="100"
						autocapitalize="none"
						spellcheck="false"
						defaultValue={v('shop_slug')}
					/>
				</div>
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
					defaultValue={v('shop_description')}></textarea>
			</Field>
			<Field
				id="contact_phone"
				label={t('seller.contactPhone')}
				hint={t('seller.contactPhoneHint')}
				error={f.fields?.contact_phone}
			>
				<input
					class="input num"
					id="contact_phone"
					name="contact_phone"
					type="tel"
					inputmode="tel"
					autocomplete="tel"
					pattern={PHONE_PATTERN}
					title={t('auth.invalidPhone')}
					required
					defaultValue={v('contact_phone', formatPhone(data.phone))}
				/>
			</Field>
			<Field id="city" label={t('seller.city')} error={f.fields?.city}>
				<input
					class="input"
					id="city"
					name="city"
					required
					maxlength="100"
					autocomplete="address-level2"
					defaultValue={v('city', 'Addis Ababa')}
				/>
			</Field>

			<div class="card delivery">
				<div class="vstack gap-4">
					<h2 class="card-t">{t('product.delivery')}</h2>
					<p class="foot muted">{t('seller.deliveryLead')}</p>
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
						defaultValue={v('delivery_fee', '0')}
					/>
				</Field>
				<Field
					id="free_over"
					label={t('seller.freeOver')}
					optional
					suffix={currency(lang())}
					hint={t('seller.freeOverHint')}
					error={f.fields?.free_over}
				>
					<input
						class="input num"
						id="free_over"
						name="free_over"
						inputmode="decimal"
						defaultValue={v('free_over')}
					/>
				</Field>
			</div>

			<Field
				id="tin"
				label={t('seller.tin')}
				optional
				hint={t('seller.tinHint')}
				error={f.fields?.tin}
			>
				<input
					class="input num"
					id="tin"
					name="tin"
					inputmode="numeric"
					pattern={'[0-9]{10}'}
					maxlength="10"
					defaultValue={v('tin')}
				/>
			</Field>

			<Submit busy={s.busy} class="btn-primary btn-block">{t('seller.open')}</Submit>
			<p class="foot muted center">{t('seller.feeNote')}</p>
		</fieldset>
	</form>
</div>

<style>
	.vstack.onboard {
		max-width: 560px;
		gap: 28px;
	}
	.card.delivery {
		gap: 20px;
	}
	fieldset {
		border: 0;
		padding: 0;
		margin: 0;
		min-width: 0;
	}
</style>
