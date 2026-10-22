<script lang="ts">
	import { resolve } from '$app/paths';
	import Pagination from '#lib/components/Pagination.svelte';
	import StatusBadge from '#lib/components/StatusBadge.svelte';
	import { formatDate, lang, t } from '#lib/i18n/index.js';
	import { formatMoney } from '#lib/money.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const orders = $derived(data.orders.items ?? []);
	// Orders the seller has to move forward right now.
	const needsAction = (status: string) => status === 'paid' || status === 'processing';
</script>

<svelte:head><title>{t('sorders.title')} · Gebeya</title></svelte:head>

<h1>{t('sorders.title')}</h1>
<p class="muted small">{t('sorders.paidOnDelivery')}</p>

{#if orders.length === 0}
	<p class="card muted">{t('sorders.empty')}</p>
{:else}
	<ul class="list card">
		{#each orders as o (o.id)}
			<li class:hot={needsAction(o.status)}>
				<a href={resolve('/seller/(app)/orders/[id]', { id: o.id })} class="spread order">
					<span class="stack-sm">
						<span class="mono">#{o.id.slice(0, 8)}</span>
						<span class="muted small">{formatDate(o.created_at, true)}</span>
					</span>
					<span class="stack-sm end">
						<span class="amount">{formatMoney(o.total_cents, lang())}</span>
						<StatusBadge status={o.status} />
					</span>
				</a>
			</li>
		{/each}
	</ul>
	<Pagination page={data.orders.page} pages={data.orders.total_pages} />
{/if}

<style>
	.order {
		color: var(--text);
		text-decoration: none;
	}
	.end {
		align-items: flex-end;
	}
	li.hot {
		box-shadow: inset 3px 0 0 var(--gold);
		padding-left: 10px;
	}
</style>
