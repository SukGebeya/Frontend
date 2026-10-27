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
	// What the seller has to do next, for orders waiting on them.
	const next: Record<string, string> = $derived({
		paid: t('sorders.accept'),
		processing: t('sorders.readyToShip')
	});
</script>

<svelte:head><title>{t('sorders.title')} · {t('brand.name')}</title></svelte:head>

<div class="page-head">
	<h1 class="t1">{t('sorders.title')}</h1>
	<p class="sub muted pretty">{t('sorders.paidOnDelivery')}</p>
	{#if data.actionRequired > 0}
		<p class="sub need">
			{data.actionRequired === 1
				? t('sorders.needOne')
				: t('sorders.needMany', { n: data.actionRequired })}
		</p>
	{/if}
</div>

{#if orders.length === 0}
	<EmptyState icon="receipt" title={t('sorders.emptyTitle')} text={t('sorders.emptyLead')}>
		<a class="btn btn-secondary btn-sm" href={resolve('/seller/(app)/products')}
			>{t('sorders.share')}</a
		>
	</EmptyState>
{:else}
	<div class="list">
		{#each orders as o (o.id)}
			<a
				class="lrow"
				class:hl={!!next[o.status]}
				href={resolve('/seller/(app)/orders/[id]', { id: o.id })}
			>
				<div class="lrow-main">
					<span class="lrow-t num">#{o.id.slice(0, 8)}</span>
					<span class="lrow-s num">{formatDate(o.created_at, true)}</span>
					{#if next[o.status]}<span class="foot need">{next[o.status]}</span>{/if}
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

<style>
	.need {
		color: var(--warning-fg);
		font-weight: 600;
	}
</style>
