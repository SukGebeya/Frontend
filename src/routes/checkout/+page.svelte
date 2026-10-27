<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Alert from '#lib/components/Alert.svelte';
	import Field from '#lib/components/Field.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Submit from '#lib/components/Submit.svelte';
	import Trust from '#lib/components/Trust.svelte';
	import { formatAddress } from '#lib/address.js';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { lang, t } from '#lib/i18n/index.js';
	import { formatMoney } from '#lib/money.js';
	import { PHONE_PATTERN, formatPhone } from '#lib/phone.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const f = $derived(formState(form));
	const pay = submitting();
	const save = submitting();

	const addresses = $derived(data.addresses);
	const created = $derived((form as { addressId?: string } | null)?.addressId);
	let chosen = $state('');
	const selectedAddress = $derived(
		chosen || created || addresses.find((a) => a.is_default)?.id || addresses[0]?.id || ''
	);
	// Open when there is nothing to choose yet, or when saving an address failed.
	let adding = $state(false);
	const addOpen = $derived(adding || addresses.length === 0 || f.values?.line1 !== undefined);
	$effect(() => {
		if (created) adding = false;
	});

	let noteLength = $state<number>();
	const amount = (cents: number) => formatMoney(cents, lang());
	const here = $derived(page.url.pathname);
</script>

<svelte:head><title>{t('checkout.title')} · {t('brand.name')}</title></svelte:head>

<div class="vstack gap-24">
	<div class="page-head">
		<a class="btn btn-link btn-sm back" href={resolve('/cart')}
			><Icon name="chevron-left" size={16} />{t('nav.cart')}</a
		>
		<h1 class="t1">{t('checkout.title')}</h1>
	</div>

	<FormMessage form={f} />
	{#if !data.phoneVerified}
		<Alert tone="warning" title={t('checkout.verifyTitle')}>
			<span>{t('verify.willSend')} <span class="num">{formatPhone(data.user?.phone)}</span></span>
			<a
				class="btn btn-primary btn-sm"
				href={resolve(`/verify-phone?next=${encodeURIComponent(here)}`)}
				>{t('checkout.verifyNow')}</a
			>
		</Alert>
	{/if}

	<!-- Saved addresses and the note join this form through form="checkout", so adding an
	     address can be its own form without nesting. -->
	<form id="checkout" method="POST" action="?/pay" use:enhance={pay.submit}>
		<input type="hidden" name="idempotency_key" value={data.idempotencyKey} />
	</form>

	<div class="split aside">
		<div class="vstack gap-32">
			<section class="vstack gap-14" aria-labelledby="addr-h">
				<h2 class="t3" id="addr-h">{t('checkout.address')}</h2>
				{#if addresses.length}
					<fieldset class="rcards">
						<legend class="sr">{t('checkout.chooseSaved')}</legend>
						{#each addresses as a (a.id)}
							<label class="rcard">
								<input
									type="radio"
									name="shipping_address_id"
									value={a.id}
									form="checkout"
									checked={selectedAddress === a.id}
									onchange={() => (chosen = a.id)}
								/>
								<span class="rcard-b">
									<span class="hstack"
										><span class="callout strong">{a.full_name}</span>{#if a.is_default}<span
												class="badge plain">{t('checkout.default')}</span
											>{/if}</span
									>
									<span class="sub muted num">{formatPhone(a.phone)}</span>
									<span class="sub muted">{formatAddress(a, t('checkout.woreda'))}</span>
								</span>
							</label>
						{/each}
					</fieldset>
				{/if}

				<details class="disclose" open={addOpen} ontoggle={(e) => (adding = e.currentTarget.open)}>
					<summary>
						<span class="summary-l"><Icon name="plus" size={18} />{t('checkout.newAddress')}</span>
						<Icon name="chevron-down" class="chev-d" />
					</summary>
					<form method="POST" action="?/address" class="disclose-b form" use:enhance={save.submit}>
						<Field id="full_name" label={t('checkout.fullName')} error={f.fields?.full_name}>
							<input
								class="input"
								id="full_name"
								name="full_name"
								autocomplete="name"
								required
								minlength="2"
								defaultValue={f.values?.full_name ?? ''}
							/>
						</Field>
						<Field id="phone" label={t('checkout.phone')} error={f.fields?.phone}>
							<input
								class="input num"
								id="phone"
								name="phone"
								type="tel"
								inputmode="tel"
								autocomplete="tel"
								pattern={PHONE_PATTERN}
								title={t('auth.invalidPhone')}
								required
								defaultValue={f.values?.phone ?? formatPhone(data.user?.phone)}
							/>
						</Field>
						<Field
							id="line1"
							label={t('checkout.line1')}
							hint={t('checkout.line1Hint')}
							error={f.fields?.line1}
						>
							<input
								class="input"
								id="line1"
								name="line1"
								autocomplete="address-line1"
								required
								minlength="5"
								defaultValue={f.values?.line1 ?? ''}
							/>
						</Field>
						<Field id="line2" label={t('checkout.line2')} optional error={f.fields?.line2}>
							<input
								class="input"
								id="line2"
								name="line2"
								autocomplete="address-line2"
								defaultValue={f.values?.line2 ?? ''}
							/>
						</Field>
						<Field id="city" label={t('checkout.city')} error={f.fields?.city}>
							<input
								class="input"
								id="city"
								name="city"
								autocomplete="address-level2"
								required
								defaultValue={f.values?.city ?? 'Addis Ababa'}
							/>
						</Field>
						<div class="row2">
							<Field id="subcity" label={t('checkout.subcity')} error={f.fields?.subcity}>
								<input
									class="input"
									id="subcity"
									name="subcity"
									list="subcities"
									autocomplete="off"
									defaultValue={f.values?.subcity ?? ''}
								/>
							</Field>
							<Field id="woreda" label={t('checkout.woreda')} error={f.fields?.woreda}>
								<input
									class="input num"
									id="woreda"
									name="woreda"
									inputmode="numeric"
									maxlength="50"
									defaultValue={f.values?.woreda ?? ''}
								/>
							</Field>
						</div>
						<datalist id="subcities">
							{#each ['Addis Ketema', 'Akaky Kaliti', 'Arada', 'Bole', 'Gullele', 'Kirkos', 'Kolfe Keranio', 'Lemi Kura', 'Lideta', 'Nifas Silk-Lafto', 'Yeka'] as name (name)}
								<option value={name}></option>
							{/each}
						</datalist>
						<Submit busy={save.busy} class="btn-secondary btn-block"
							>{t('checkout.saveAddress')}</Submit
						>
					</form>
				</details>
			</section>

			<section class="field">
				<label class="t3" for="notes"
					>{t('checkout.notes')}
					<span class="callout faint opt">({t('common.optional')})</span></label
				>
				<textarea
					class="input"
					id="notes"
					name="notes"
					form="checkout"
					maxlength="500"
					placeholder={t('checkout.notesPlaceholder')}
					aria-describedby="notes-msg"
					defaultValue={f.values?.notes ?? ''}
					oninput={(e) => (noteLength = e.currentTarget.value.length)}></textarea>
				<div class="count-row">
					<span class="hint" id="notes-msg">{f.fields?.notes ?? t('checkout.notesHint')}</span>
					<span class="hint num" aria-hidden="true"
						>{noteLength ?? (f.values?.notes ?? '').length} / 500</span
					>
				</div>
			</section>
		</div>

		<aside class="card summary" aria-labelledby="sum-h">
			<h2 class="card-t" id="sum-h">{t('checkout.summary')}</h2>
			{#each data.cart.items ?? [] as item (item.id)}
				<div class="hstack item">
					<span class="thumb-s" aria-hidden="true"><Icon name="image" /></span>
					<div class="lrow-main">
						<span class="callout strong"
							>{item.product_name}<span class="sr">&nbsp;·&nbsp;</span></span
						><span class="foot muted">{item.variant_title} × {item.quantity}</span>
					</div>
					<span class="callout num">{amount(item.subtotal_cents)}</span>
				</div>
			{/each}
			<div class="mrows">
				<div class="mrow">
					<span>{t('checkout.items')}</span><span>{amount(data.cart.total_cents)}</span>
				</div>
				<div class="mrow">
					<span>{t('order.delivery')}</span><span>{t('cart.deliveryLater')}</span>
				</div>
			</div>
			<p class="foot muted">{t('checkout.deliveryAdded')}</p>
			<p class="foot muted note">
				<Icon name="card" size={16} /><span>{t('checkout.payHint')}</span>
			</p>
			<Submit
				busy={pay.busy}
				class="btn-primary btn-block"
				form="checkout"
				disabled={!selectedAddress || !data.phoneVerified}
			>
				{pay.busy ? t('checkout.opening') : t('checkout.pay')}
			</Submit>
			<Trust small title={t('checkout.heldTitle')} text={t('checkout.heldText')} />
		</aside>
	</div>
</div>

<style>
	.card.summary {
		gap: 18px;
	}
	.hstack.item {
		flex-wrap: nowrap;
		gap: 12px;
	}
	.opt {
		font-weight: 400;
	}
	.summary :global(.trust) {
		background: var(--bg);
		padding: 14px 16px;
	}
</style>
