<script lang="ts">
	import { enhance } from '$app/forms';
	import Alert from '#lib/components/Alert.svelte';
	import Field from '#lib/components/Field.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import OrderProgress from '#lib/components/OrderProgress.svelte';
	import OrderSummary from '#lib/components/OrderSummary.svelte';
	import StatusBadge from '#lib/components/StatusBadge.svelte';
	import { confirmFirst, formState, submitting } from '#lib/forms.svelte.js';
	import { formatDate, lang, t } from '#lib/i18n/index.js';
	import { formatMoney } from '#lib/money.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const f = $derived(formState(form));
	const s = submitting();
	const order = $derived(data.detail.order);
	// Mirrors settlement: goods minus the platform fee, plus the delivery fee the seller charged.
	const earnings = $derived(
		order.subtotal_cents - order.platform_fee_cents + order.delivery_fee_cents
	);
	const amount = (cents: number) => formatMoney(cents, lang());
	const today = new Date().toISOString().slice(0, 10);
	const cancelSubmit = confirmFirst(() => t('sorders.cancelConfirm'), s.submit);
</script>

<svelte:head><title>{t('order.title', { id: order.id.slice(0, 8) })} · Gebeya</title></svelte:head>

<header class="spread">
	<div>
		<h1 class="mono">{t('order.title', { id: `#${order.id.slice(0, 8)}` })}</h1>
		<p class="muted small">{t('order.placed', { date: formatDate(order.created_at, true) })}</p>
	</div>
	<StatusBadge status={order.status} />
</header>

<OrderProgress status={order.status} />
<FormMessage form={f} />

{#if order.status === 'disputed'}
	<Alert tone="warn">
		<p>{t('order.disputeOpen', { reason: order.dispute_reason ?? '' })}</p>
		<p class="small">{t('sorders.disputed')}</p>
	</Alert>
{/if}

{#if order.status === 'paid'}
	<form method="POST" action="?/accept" use:enhance={s.submit}>
		<button class="btn primary block" disabled={s.busy}>{t('sorders.accept')}</button>
	</form>
{:else if order.status === 'processing'}
	<form method="POST" action="?/ship" class="card stack" use:enhance={s.submit}>
		<div class="grid-2">
			<Field id="carrier" label={t('order.carrier')} error={f.fields?.carrier}>
				<input
					id="carrier"
					name="carrier"
					maxlength="100"
					list="carriers"
					defaultValue={f.values?.carrier ?? ''}
				/>
			</Field>
			<Field id="tracking_number" label={t('order.tracking')} error={f.fields?.tracking_number}>
				<input
					id="tracking_number"
					name="tracking_number"
					maxlength="100"
					defaultValue={f.values?.tracking_number ?? ''}
				/>
			</Field>
		</div>
		<Field id="estimated_delivery" label={t('order.eta')} error={f.fields?.estimated_delivery}>
			<input
				id="estimated_delivery"
				name="estimated_delivery"
				type="date"
				min={today}
				defaultValue={f.values?.estimated_delivery ?? ''}
			/>
		</Field>
		<datalist id="carriers">
			{#each ['Ethio Post', 'Deliver Addis', 'Zmall', 'Self delivery'] as name (name)}
				<option value={name}></option>
			{/each}
		</datalist>
		<button class="btn primary block" disabled={s.busy}>{t('sorders.ship')}</button>
	</form>
{/if}

<OrderSummary detail={data.detail} />

<section class="card">
	<dl class="kv">
		<dt>{t('order.goods')}</dt>
		<dd class="amount">{amount(order.subtotal_cents)}</dd>
		<dt>{t('sorders.fee')}</dt>
		<dd class="amount">−{amount(order.platform_fee_cents)}</dd>
		<dt>{t('order.delivery')}</dt>
		<dd class="amount">{amount(order.delivery_fee_cents)}</dd>
		<dt class="total">{t('sorders.earnings')}</dt>
		<dd class="total amount">{amount(earnings)}</dd>
	</dl>
</section>

{#if order.status === 'paid' || order.status === 'processing'}
	<form method="POST" action="?/cancel" use:enhance={cancelSubmit}>
		<button class="btn danger sm" disabled={s.busy}>{t('sorders.cancel')}</button>
	</form>
{/if}
