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
	import Trust from '#lib/components/Trust.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { formatDate, lang, t, tSplit } from '#lib/i18n/index.js';
	import { formatMoney } from '#lib/money.js';
	import { AUTO_CONFIRM_DAYS, autoConfirmAt } from '#lib/orders.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const f = $derived(formState(form));
	const s = submitting();
	const order = $derived(data.detail.order);
	const shipment = $derived(data.detail.shipment);
	const status = $derived(order.status);
	const canDispute = $derived(status === 'shipped' || status === 'processing');
	const amount = (cents: number) => formatMoney(cents, lang());

	const autoConfirm = $derived(formatDate(autoConfirmAt(shipment?.shipped_at)));
	const autoParts = $derived(tSplit('order.autoConfirmOn', 'date', { days: AUTO_CONFIRM_DAYS }));

	let report = $state<HTMLDetailsElement>();
	function closeReport(e: MouseEvent) {
		if (!report) return;
		e.preventDefault();
		report.open = false;
	}
</script>

<svelte:head
	><title>{t('order.title', { id: `#${order.id.slice(0, 8)}` })} · {t('brand.name')}</title
	></svelte:head
>

<div class="vstack gap-24">
	<div class="page-head">
		<a class="btn btn-link btn-sm back" href={resolve('/orders')}
			><Icon name="chevron-left" size={16} />{t('orders.title')}</a
		>
		<div class="hstack between title">
			<h1 class="t1 num">{t('order.title', { id: `#${order.id.slice(0, 8)}` })}</h1>
			<StatusBadge {status} />
		</div>
		<p class="sub muted num">{t('order.placed', { date: formatDate(order.created_at, true) })}</p>
	</div>

	<FormMessage form={f} />

	<div class="split aside">
		<div class="vstack">
			<section class="card status" aria-label={t('order.status')}>
				<OrderProgress {status} />

				{#if status === 'pending_payment'}
					<div class="vstack gap-6">
						<h2 class="t3">{t('order.pendingTitle')}</h2>
						<p class="callout muted pretty">{t('order.pendingLead')}</p>
					</div>
					<div class="actions">
						<form method="POST" action="?/refresh" class="hstack" use:enhance={s.submit}>
							<Submit busy={s.busy} class="btn-primary btn-block">{t('order.checkPayment')}</Submit>
						</form>
						<form method="POST" action="?/cancel" class="hstack" use:enhance={s.submit}>
							<Submit busy={s.busy} class="btn-danger btn-block">{t('order.cancel')}</Submit>
						</form>
					</div>
				{:else if status === 'paid'}
					<div class="vstack gap-6">
						<h2 class="t3">{t('pay.paid')}</h2>
						<p class="callout muted pretty">{t('order.paidLead')}</p>
					</div>
					<form method="POST" action="?/cancel" class="hstack" use:enhance={s.submit}>
						<Submit busy={s.busy} class="btn-danger btn-fluid">{t('order.cancel')}</Submit>
					</form>
				{:else if status === 'processing'}
					<div class="vstack gap-6">
						<h2 class="t3">{t('order.processingTitle')}</h2>
						<p class="callout muted pretty">{t('order.processingLead')}</p>
					</div>
				{:else if status === 'shipped'}
					<div class="vstack gap-6">
						<h2 class="t3">{t('order.shippedTitle')}</h2>
						<p class="callout muted pretty">{t('order.shippedLead')}</p>
					</div>
					<div class="release">
						<Alert tone="neutral" icon="shield" title={t('order.releaseTitle')}>
							<span class="muted"
								>{#if autoConfirm}{autoParts[0]}<span class="num strong ink">{autoConfirm}</span
									>{autoParts[1]}{:else}{t('order.autoConfirm')}{/if}</span
							>
						</Alert>
					</div>
					<form method="POST" action="?/confirm" class="hstack" use:enhance={s.submit}>
						<Submit busy={s.busy} class="btn-primary btn-fluid">{t('order.confirm')}</Submit>
					</form>
				{:else if status === 'delivered'}
					<Alert tone="success" title={t('status.delivered')}>
						<span
							>{t('order.deliveredLead', {
								date: formatDate(shipment?.delivered_at ?? order.updated_at, true)
							})}</span
						>
					</Alert>
				{:else if status === 'disputed'}
					<Alert tone="warning" title={t('order.reviewingTitle')}>
						<span>{t('order.reviewingLead')}</span>
					</Alert>
					{#if order.dispute_reason}
						<div class="kv">
							<dt>{t('order.youReported')}</dt>
							<dd>“{order.dispute_reason}”</dd>
						</div>
					{/if}
				{:else if status === 'cancelled'}
					<Alert tone="neutral" title={t('order.cancelledTitle')}>
						<span>{t('order.cancelledLead')}</span>
					</Alert>
				{:else if status === 'refunded'}
					<Alert tone="neutral" title={t('status.refunded')}>
						<span>{t('order.refundedLead', { amount: amount(order.total_cents) })}</span>
					</Alert>
				{/if}
			</section>

			{#if canDispute}
				<details class="disclose" bind:this={report} open={!!f.fields?.reason}>
					<summary>
						<span class="summary-l"><Icon name="warning" size={18} />{t('order.dispute')}</span>
						<Icon name="chevron-down" class="chev-d" />
					</summary>
					<form method="POST" action="?/dispute" class="disclose-b" use:enhance={s.submit}>
						<p class="sub muted pretty">{t('order.disputeLead')}</p>
						<Field
							id="reason"
							label={t('order.disputeReason')}
							hint={t('order.reasonHint')}
							error={f.fields?.reason}
						>
							<textarea
								class="input"
								id="reason"
								name="reason"
								required
								minlength="5"
								maxlength="1000"
								placeholder={t('order.reasonPlaceholder')}
								defaultValue={f.values?.reason ?? ''}></textarea>
						</Field>
						<div class="actions">
							<Submit busy={s.busy} class="btn-danger btn-fluid">{t('order.disputeSubmit')}</Submit>
							<a
								class="btn btn-secondary btn-fluid"
								href={resolve('/orders/[id]', { id: order.id })}
								onclick={closeReport}>{t('common.cancel')}</a
							>
						</div>
					</form>
				</details>
			{/if}

			<OrderItems items={data.detail.items ?? []}>
				<div class="mrows">
					<div class="mrow">
						<span>{t('order.goods')}</span><span>{amount(order.subtotal_cents)}</span>
					</div>
					<div class="mrow">
						<span>{t('order.delivery')}</span><span>{amount(order.delivery_fee_cents)}</span>
					</div>
					<div class="mrow total big">
						<span>{status === 'pending_payment' ? t('order.total') : t('order.totalPaid')}</span
						><span>{amount(order.total_cents)}</span>
					</div>
				</div>
			</OrderItems>
		</div>

		<div class="vstack">
			{#if shipment && (status === 'shipped' || status === 'delivered' || status === 'disputed')}
				<section class="card" aria-labelledby="ship-h">
					<h2 class="card-t" id="ship-h">{t('order.shipment')}</h2>
					<ShipmentDetails {shipment} showShipped />
				</section>
			{/if}
			{#if order.shipping_address_id || data.detail.shipping_address}
				<DeliverTo detail={data.detail} />
			{/if}
			{#if status !== 'cancelled' && status !== 'refunded' && status !== 'delivered'}
				<Trust title={t('product.protection')} text={t('product.protectionBody')} />
			{/if}
		</div>
	</div>
</div>

<style>
	.hstack.title {
		gap: 12px;
	}
	.card.status {
		gap: 20px;
	}
	.release :global(.alert) {
		background: var(--surface);
	}
	.release :global(.alert > svg) {
		color: var(--accent);
	}
	.ink {
		color: var(--ink);
	}
</style>
