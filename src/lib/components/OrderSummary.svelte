<script lang="ts">
	import type { OrderDetail } from '#lib/api/types.js';
	import { formatDate, lang, t } from '#lib/i18n/index.js';
	import { formatMoney } from '#lib/money.js';
	import { formatPhone } from '#lib/phone.js';

	let { detail, showAddress = true }: { detail: OrderDetail; showAddress?: boolean } = $props();

	const order = $derived(detail.order);
	const address = $derived(detail.shipping_address);
	const shipment = $derived(detail.shipment);
	const amount = (cents: number) => formatMoney(cents, lang());
</script>

<section class="card stack-sm" aria-labelledby="items-{order.id}">
	<h2 id="items-{order.id}">{t('order.items')}</h2>
	<ul class="list">
		{#each detail.items ?? [] as item (item.id)}
			<li class="spread">
				<span>
					{item.product_name}
					<span class="muted small">· {item.variant_title} × {item.quantity}</span>
				</span>
				<span class="amount">{amount(item.total_price_cents)}</span>
			</li>
		{/each}
	</ul>
	<dl class="kv">
		<dt>{t('order.goods')}</dt>
		<dd class="amount">{amount(order.subtotal_cents)}</dd>
		<dt>{t('order.delivery')}</dt>
		<dd class="amount">{amount(order.delivery_fee_cents)}</dd>
		<dt class="total">{t('order.total')}</dt>
		<dd class="total amount">{amount(order.total_cents)}</dd>
	</dl>
	{#if order.notes}
		<p class="small"><span class="muted">{t('order.note')}:</span> {order.notes}</p>
	{/if}
</section>

{#if showAddress && order.shipping_address_id}
	<section class="card stack-sm">
		<h2>{t('order.deliverTo')}</h2>
		{#if address}
			<p>
				<strong>{address.full_name}</strong> ·
				<a href="tel:{address.phone}">{formatPhone(address.phone)}</a>
			</p>
			<p class="muted">
				{[
					address.line1,
					address.line2,
					address.woreda && `${t('checkout.woreda')} ${address.woreda}`,
					address.subcity,
					address.city
				]
					.filter(Boolean)
					.join(', ')}
			</p>
		{:else}
			<p class="muted">{t('order.noAddress')}</p>
		{/if}
	</section>
{/if}

{#if shipment && (shipment.carrier || shipment.tracking_number || shipment.estimated_delivery)}
	<section class="card stack-sm">
		<h2>{t('order.shipment')}</h2>
		<dl class="kv">
			{#if shipment.carrier}<dt>{t('order.carrier')}</dt>
				<dd>{shipment.carrier}</dd>{/if}
			{#if shipment.tracking_number}<dt>{t('order.tracking')}</dt>
				<dd class="mono">{shipment.tracking_number}</dd>{/if}
			{#if shipment.estimated_delivery}<dt>{t('order.eta')}</dt>
				<dd>{formatDate(shipment.estimated_delivery)}</dd>{/if}
		</dl>
	</section>
{/if}
