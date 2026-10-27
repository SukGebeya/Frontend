<script lang="ts">
	import { resolve } from '$app/paths';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Pagination from '#lib/components/Pagination.svelte';
	import StatusBadge from '#lib/components/StatusBadge.svelte';
	import { formatDate, lang, t } from '#lib/i18n/index.js';
	import { formatMoney } from '#lib/money.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const orders = $derived(data.orders.items ?? []);
</script>

<svelte:head><title>{t('orders.title')} · {t('brand.name')}</title></svelte:head>

<div class="vstack gap-24 orders">
	<div class="page-head">
		<h1 class="t1">{t('orders.title')}</h1>
		{#if orders.length}<p class="sub muted">{t('orders.newest')}</p>{/if}
	</div>

	{#if orders.length === 0}
		<EmptyState icon="receipt" title={t('orders.empty')} text={t('orders.emptyLead')}>
			<a class="btn btn-secondary btn-sm" href={resolve('/')}>{t('common.home')}</a>
		</EmptyState>
	{:else}
		<div class="list">
			{#each orders as o (o.id)}
				<a class="lrow" href={resolve('/orders/[id]', { id: o.id })}>
					<div class="lrow-main">
						<span class="lrow-t num">{t('order.title', { id: `#${o.id.slice(0, 8)}` })}</span>
						<span class="lrow-s">{formatDate(o.created_at)}</span>
					</div>
					<div class="lrow-end">
						<span class="lrow-amt">{formatMoney(o.total_cents, lang())}</span>
						<StatusBadge status={o.status} />
					</div>
					<Icon name="chevron-right" size={18} class="chev" />
				</a>
			{/each}
		</div>
		<Pagination page={data.orders.page} pages={data.orders.total_pages} />
	{/if}
</div>

<style>
	.vstack.orders {
		max-width: 860px;
	}
</style>
