<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Alert from '#lib/components/Alert.svelte';
	import Field from '#lib/components/Field.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
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
	let adding = $state(false);
	$effect(() => {
		if (created) adding = false;
	});
	const showNewAddress = $derived(
		adding || addresses.length === 0 || f.values?.line1 !== undefined
	);
	const amount = (cents: number) => formatMoney(cents, lang());
	const here = $derived(page.url.pathname);
</script>

<svelte:head><title>{t('checkout.title')} · Gebeya</title></svelte:head>

<section class="stack">
	<h1>{t('checkout.title')}</h1>
	<FormMessage form={f} />

	{#if !data.phoneVerified}
		<Alert tone="warn">
			{t('checkout.verifyFirst')}
			<a href={resolve(`/verify-phone?next=${encodeURIComponent(here)}`)}
				>{t('checkout.verifyNow')}</a
			>
		</Alert>
	{/if}

	<section class="card stack-sm" aria-labelledby="summary">
		<h2 id="summary">{t('checkout.summary')}</h2>
		<ul class="list">
			{#each data.cart.items ?? [] as item (item.id)}
				<li class="spread">
					<span>{item.product_name} · {item.variant_title} × {item.quantity}</span>
					<span class="amount">{amount(item.subtotal_cents)}</span>
				</li>
			{/each}
		</ul>
		<dl class="kv">
			<dt class="total">{t('checkout.items')}</dt>
			<dd class="total amount">{amount(data.cart.total_cents)}</dd>
		</dl>
		<p class="muted small">{t('checkout.deliveryAdded')}</p>
	</section>

	<section class="card stack" aria-labelledby="address">
		<h2 id="address">{t('checkout.address')}</h2>
		{#if addresses.length}
			<div class="stack-sm" role="radiogroup" aria-labelledby="address">
				{#each addresses as a (a.id)}
					<label class="address" class:active={selectedAddress === a.id}>
						<input
							type="radio"
							name="address_choice"
							value={a.id}
							checked={selectedAddress === a.id}
							onchange={() => (chosen = a.id)}
						/>
						<span>
							<strong>{a.full_name}</strong> · {formatPhone(a.phone)}<br />
							<span class="muted small">
								{[
									a.line1,
									a.line2,
									a.woreda && `${t('checkout.woreda')} ${a.woreda}`,
									a.subcity,
									a.city
								]
									.filter(Boolean)
									.join(', ')}
							</span>
						</span>
					</label>
				{/each}
			</div>
			{#if !showNewAddress}
				<button type="button" class="btn link" onclick={() => (adding = true)}
					>+ {t('checkout.newAddress')}</button
				>
			{/if}
		{/if}

		{#if showNewAddress}
			<form method="POST" action="?/address" class="stack" use:enhance={save.submit}>
				<div class="grid-2">
					<Field id="full_name" label={t('checkout.fullName')} error={f.fields?.full_name}>
						<input
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
							id="phone"
							name="phone"
							type="tel"
							autocomplete="tel"
							pattern={PHONE_PATTERN}
							title={t('auth.invalidPhone')}
							required
							defaultValue={f.values?.phone ?? formatPhone(data.user?.phone)}
						/>
					</Field>
				</div>
				<Field
					id="line1"
					label={t('checkout.line1')}
					hint={t('checkout.line1Hint')}
					error={f.fields?.line1}
				>
					<input
						id="line1"
						name="line1"
						autocomplete="address-line1"
						required
						minlength="5"
						defaultValue={f.values?.line1 ?? ''}
					/>
				</Field>
				<Field id="line2" label={t('checkout.line2')} error={f.fields?.line2}>
					<input
						id="line2"
						name="line2"
						autocomplete="address-line2"
						defaultValue={f.values?.line2 ?? ''}
					/>
				</Field>
				<div class="grid-2">
					<Field id="city" label={t('checkout.city')} error={f.fields?.city}>
						<input
							id="city"
							name="city"
							autocomplete="address-level2"
							required
							defaultValue={f.values?.city ?? 'Addis Ababa'}
						/>
					</Field>
					<Field id="subcity" label={t('checkout.subcity')} error={f.fields?.subcity}>
						<input
							id="subcity"
							name="subcity"
							list="subcities"
							defaultValue={f.values?.subcity ?? ''}
						/>
					</Field>
				</div>
				<Field id="woreda" label={t('checkout.woreda')} error={f.fields?.woreda}>
					<input
						id="woreda"
						name="woreda"
						inputmode="numeric"
						maxlength="50"
						defaultValue={f.values?.woreda ?? ''}
					/>
				</Field>
				<datalist id="subcities">
					{#each ['Addis Ketema', 'Akaky Kaliti', 'Arada', 'Bole', 'Gullele', 'Kirkos', 'Kolfe Keranio', 'Lemi Kura', 'Lideta', 'Nifas Silk-Lafto', 'Yeka'] as name (name)}
						<option value={name}></option>
					{/each}
				</datalist>
				<button class="btn" disabled={save.busy}>{t('checkout.saveAddress')}</button>
			</form>
		{/if}
	</section>

	<form method="POST" action="?/pay" class="card stack" use:enhance={pay.submit}>
		<input type="hidden" name="idempotency_key" value={data.idempotencyKey} />
		<input type="hidden" name="shipping_address_id" value={selectedAddress} />
		<Field id="notes" label={t('checkout.notes')} error={f.fields?.notes}>
			<textarea id="notes" name="notes" maxlength="500" defaultValue={f.values?.notes ?? ''}
			></textarea>
		</Field>
		<button
			class="btn primary block"
			disabled={pay.busy || !selectedAddress || !data.phoneVerified}
		>
			{t('checkout.pay')}
		</button>
		<p class="muted small center">{t('checkout.payHint')}</p>
	</form>
</section>

<style>
	.address {
		display: flex;
		gap: 10px;
		align-items: flex-start;
		padding: 10px 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		cursor: pointer;
	}
	.address.active {
		border-color: var(--accent);
		box-shadow: inset 0 0 0 1px var(--accent);
	}
	.address input {
		margin-top: 4px;
	}
	.center {
		text-align: center;
	}
</style>
