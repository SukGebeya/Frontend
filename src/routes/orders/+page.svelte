<script lang="ts">
	import { resolve } from '$app/paths';
	import Pagination from '#lib/components/Pagination.svelte';
	import StatusBadge from '#lib/components/StatusBadge.svelte';
	import { formatDate, lang, t } from '#lib/i18n/index.js';
	import { formatMoney } from '#lib/money.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const orders = $derived(data.orders.items ?? []);
</script>

<svelte:head><title>{t('orders.title')} · Gebeya</title></svelte:head>

<section class="stack">
	<h1>{t('orders.title')}</h1>
	{#if orders.length === 0}
		<p class="card muted">{t('orders.empty')}</p>
	{:else}
		<ul class="list card">
			{#each orders as o (o.id)}
				<li>
					<a href={resolve('/orders/[id]', { id: o.id })} class="spread order">
						<span class="stack-sm">
							<span class="mono">#{o.id.slice(0, 8)}</span>
							<span class="muted small">{formatDate(o.created_at)}</span>
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
</section>

<style>
	.order {
		color: var(--text);
		text-decoration: none;
	}
	.end {
		align-items: flex-end;
	}
</style>
