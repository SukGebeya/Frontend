<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import Alert from '#lib/components/Alert.svelte';
	import DeliverTo from '#lib/components/DeliverTo.svelte';
	import Field from '#lib/components/Field.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import OrderItems from '#lib/components/OrderItems.svelte';
	import OrderProgress from '#lib/components/OrderProgress.svelte';
	import ShipmentDetails from '#lib/components/ShipmentDetails.svelte';
	import StatusBadge from '#lib/components/StatusBadge.svelte';
	import Submit from '#lib/components/Submit.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { formatDate, lang, t, tSplit, tv } from '#lib/i18n/index.js';
	import { formatMoney } from '#lib/money.js';
	import { autoConfirmAt } from '#lib/orders.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const f = $derived(formState(form));
	const s = submitting();
	const order = $derived(data.detail.order);
	const shipment = $derived(data.detail.shipment);
	const status = $derived(order.status);
	// Mirrors settlement: goods minus the platform fee, plus the delivery fee the seller charged.
	const earnings = $derived(
		order.subtotal_cents - order.platform_fee_cents + order.delivery_fee_cents
	);
	const amount = (cents: number) => formatMoney(cents, lang());
	const today = new Date().toISOString().slice(0, 10);

	const autoConfirm = $derived(formatDate(autoConfirmAt(shipment?.shipped_at)));
	const paidOn = $derived(tSplit('sorders.paidOn', 'date'));
	const credited = $derived(tSplit('sorders.credited', 'wallet', { amount: amount(earnings) }));
</script>

<svelte:head
	><title>{t('order.title', { id: `#${order.id.slice(0, 8)}` })} · {t('brand.name')}</title
	></svelte:head
>

<div class="page-head">
	<a class="btn btn-link btn-sm back" href={resolve('/seller/(app)/orders')}
		><Icon name="chevron-left" size={16} />{t('sorders.title')}</a
	>
	<div class="hstack between title">
		<h1 class="t1 num">{t('order.title', { id: `#${order.id.slice(0, 8)}` })}</h1>
		<StatusBadge {status} />
	</div>
	<p class="sub muted num">{t('order.placed', { date: formatDate(order.created_at, true) })}</p>
</div>

<FormMessage form={f} />

<div class="split half">
	<div class="vstack">
		<section class="card next" aria-label={t('sorders.nextStep')}>
			<OrderProgress {status} />

			{#if status === 'paid'}
				<div class="vstack gap-6">
					<h2 class="t3">{t('sorders.paidTitle')}</h2>
					<p class="callout muted pretty">{t('sorders.paidLead')}</p>
				</div>
				<form method="POST" action="?/accept" class="hstack" use:enhance={s.submit}>
					<Submit busy={s.busy} class="btn-primary btn-fluid">{t('sorders.accept')}</Submit>
				</form>
			{:else if status === 'processing'}
				<div class="vstack gap-6">
					<h2 class="t3">{t('sorders.shipTitle')}</h2>
					<p class="callout muted pretty">{t('sorders.shipLead')}</p>
				</div>
				<form method="POST" action="?/ship" class="form" use:enhance={s.submit}>
					<Field
						id="carrier"
						label={t('order.carrier')}
						hint={t('sorders.carrierHint')}
						error={f.fields?.carrier}
					>
						<input
							class="input"
							id="carrier"
							name="carrier"
							maxlength="100"
							list="carriers"
							defaultValue={f.values?.carrier ?? ''}
						/>
					</Field>
					<datalist id="carriers">
						{#each ['Ethio Post', 'Deliver Addis', 'Zmall', 'Self delivery'] as name (name)}
							<option value={name}></option>
						{/each}
					</datalist>
					<Field
						id="tracking_number"
						label={t('order.tracking')}
						optional
						error={f.fields?.tracking_number}
					>
						<input
							class="input num"
							id="tracking_number"
							name="tracking_number"
							maxlength="100"
							defaultValue={f.values?.tracking_number ?? ''}
						/>
					</Field>
					<Field
						id="estimated_delivery"
						label={t('order.eta')}
						optional
						hint={t('sorders.etaHint')}
						error={f.fields?.estimated_delivery}
					>
						<input
							class="input"
							id="estimated_delivery"
							name="estimated_delivery"
							type="date"
							min={today}
							defaultValue={f.values?.estimated_delivery ?? ''}
						/>
					</Field>
					<Submit busy={s.busy} class="btn-primary btn-fluid">{t('sorders.ship')}</Submit>
				</form>
			{:else if status === 'shipped'}
				<div class="vstack gap-6">
					<h2 class="t3">{t('status.shipped')}</h2>
					<p class="callout muted pretty">
						{#if autoConfirm}{paidOn[0]}<span class="num strong ink">{autoConfirm}</span
							>{paidOn[1]}{:else}{t('sorders.paidOnDelivery')}{/if}
					</p>
				</div>
				{#if shipment}<ShipmentDetails {shipment} />{/if}
			{:else if status === 'delivered'}
				<Alert tone="success" title={t('status.delivered')}>
					<span
						>{credited[0]}<a href={resolve('/seller/(app)/wallet')}>{t('sorders.wallet')}</a
						>{credited[1]}</span
					>
				</Alert>
			{:else if status === 'disputed'}
				<Alert tone="warning" title={t('sorders.disputeTitle')}>
					<span
						>{#if order.dispute_reason}{t('sorders.buyerWrote', { reason: order.dispute_reason })}
						{/if}{t('sorders.disputed')}</span
					>
				</Alert>
			{:else if status === 'cancelled' || status === 'refunded'}
				<Alert tone="neutral" title={tv('status', status)}>
					<span>{t('sorders.closedLead', { amount: amount(order.total_cents) })}</span>
				</Alert>
			{/if}
		</section>

		{#if status === 'paid' || status === 'processing'}
			<details class="disclose danger">
				<summary
					><span>{t('sorders.cancel')}</span><Icon name="chevron-down" class="chev-d" /></summary
				>
				<form method="POST" action="?/cancel" class="disclose-b" use:enhance={s.submit}>
					<p class="sub muted pretty">
						{t('sorders.cancelLead', { amount: amount(order.total_cents) })}
					</p>
					<Submit busy={s.busy} class="btn-danger btn-block">{t('sorders.cancel')}</Submit>
				</form>
			</details>
		{/if}

		<OrderItems items={data.detail.items ?? []} />
	</div>

	<div class="vstack">
		<section class="card" aria-labelledby="earn-h">
			<h2 class="card-t" id="earn-h">{t('sorders.earningsTitle')}</h2>
			<div class="mrows">
				<div class="mrow">
					<span>{t('order.goods')}</span><span>{amount(order.subtotal_cents)}</span>
				</div>
				<div class="mrow">
					<span>{t('sorders.fee')}</span><span>−{amount(order.platform_fee_cents)}</span>
				</div>
				<div class="mrow">
					<span>{t('order.delivery')}</span><span>{amount(order.delivery_fee_cents)}</span>
				</div>
				<div class="mrow total big">
					<span>{t('sorders.earnings')}</span><span>{amount(earnings)}</span>
				</div>
			</div>
			<p class="foot muted">{t('sorders.earningsNote')}</p>
		</section>

		{#if order.shipping_address_id || data.detail.shipping_address}
			<DeliverTo detail={data.detail} seller />
		{/if}
	</div>
</div>

<style>
	.hstack.title {
		gap: 12px;
	}
	.split.half {
		gap: 16px;
	}
	.card.next {
		gap: 20px;
	}
	.ink {
		color: var(--ink);
	}
</style>
