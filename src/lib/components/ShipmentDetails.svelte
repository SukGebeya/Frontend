<script lang="ts">
	import type { Shipment } from '#lib/api/types.js';
	import { formatDate, t } from '#lib/i18n/index.js';

	let { shipment, showShipped = false }: { shipment: Shipment; showShipped?: boolean } = $props();
</script>

<dl class="kvs">
	{#if shipment.carrier}
		<div class="kv">
			<dt>{t('order.carrier')}</dt>
			<dd>{shipment.carrier}</dd>
		</div>
	{/if}
	{#if shipment.tracking_number}
		<div class="kv">
			<dt>{t('order.tracking')}</dt>
			<dd class="num">{shipment.tracking_number}</dd>
		</div>
	{/if}
	{#if shipment.estimated_delivery}
		<div class="kv">
			<dt>{t('order.eta')}</dt>
			<dd class="num">{formatDate(shipment.estimated_delivery)}</dd>
		</div>
	{/if}
	{#if showShipped && shipment.shipped_at}
		<div class="kv">
			<dt>{t('order.shippedAt')}</dt>
			<dd class="num">{formatDate(shipment.shipped_at, true)}</dd>
		</div>
	{/if}
</dl>
