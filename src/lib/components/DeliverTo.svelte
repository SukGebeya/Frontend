<script lang="ts">
	import Icon from './Icon.svelte';
	import type { OrderDetail } from '#lib/api/types.js';
	import { t } from '#lib/i18n/index.js';
	import { formatPhone } from '#lib/phone.js';

	// The buyer sees their phone as a detail; the seller gets a button to call the buyer.
	let { detail, seller = false }: { detail: OrderDetail; seller?: boolean } = $props();

	const address = $derived(detail.shipping_address);
	const notes = $derived(detail.order.notes);
	const street = $derived(address ? [address.line1, address.line2].filter(Boolean).join(', ') : '');
	const area = $derived(
		address
			? [
					address.woreda && `${t('checkout.woreda')} ${address.woreda}`,
					address.subcity,
					address.city
				]
					.filter(Boolean)
					.join(', ')
			: ''
	);
</script>

<section class="card" aria-labelledby="to-h">
	<h2 class="card-t" id="to-h">{t('order.deliverTo')}</h2>
	{#if address}
		<dl class="kvs">
			<div class="kv">
				<dt>{t('order.name')}</dt>
				<dd>{address.full_name}</dd>
			</div>
			{#if !seller}
				<div class="kv">
					<dt>{t('order.phone')}</dt>
					<dd class="num"><a href="tel:{address.phone}">{formatPhone(address.phone)}</a></dd>
				</div>
			{/if}
			<div class="kv">
				<dt>{t('order.address')}</dt>
				<dd>
					{street}{#if street && area}<br />{/if}{area}
				</dd>
			</div>
			{#if notes}
				<div class="kv">
					<dt>{seller ? t('order.buyerNote') : t('order.yourNote')}</dt>
					<dd>{notes}</dd>
				</div>
			{/if}
		</dl>
		{#if seller}
			<a class="btn btn-secondary btn-block" href="tel:{address.phone}"
				><Icon name="phone" size={18} />{t('order.call', { phone: formatPhone(address.phone) })}</a
			>
		{/if}
	{:else}
		<p class="callout muted">{t('order.noAddress')}</p>
		{#if notes}
			<div class="kv">
				<dt>{seller ? t('order.buyerNote') : t('order.yourNote')}</dt>
				<dd>{notes}</dd>
			</div>
		{/if}
	{/if}
</section>
