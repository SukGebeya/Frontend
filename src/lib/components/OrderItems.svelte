<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import type { OrderItem } from '#lib/api/types.js';
	import { lang, t } from '#lib/i18n/index.js';
	import { formatMoney } from '#lib/money.js';

	let { items, children }: { items: OrderItem[]; children?: Snippet } = $props();
</script>

<section class="card" aria-labelledby="items-h">
	<h2 class="card-t" id="items-h">{t('order.items')}</h2>
	{#each items as item (item.id)}
		<div class="item">
			<span class="thumb-s" aria-hidden="true"><Icon name="image" /></span>
			<div class="lrow-main">
				<span class="callout strong">{item.product_name}<span class="sr">&nbsp;·&nbsp;</span></span
				><span class="foot muted">{item.variant_title} × {item.quantity}</span>
			</div>
			<span class="callout num">{formatMoney(item.total_price_cents, lang())}</span>
		</div>
	{/each}
	{@render children?.()}
</section>

<style>
	.item {
		display: flex;
		align-items: center;
		gap: 12px;
	}
</style>
