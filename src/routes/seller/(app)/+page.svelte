<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Alert from '#lib/components/Alert.svelte';
	import CopyLink from '#lib/components/CopyLink.svelte';
	import StatusBadge from '#lib/components/StatusBadge.svelte';
	import { lang, t } from '#lib/i18n/index.js';
	import { formatMoney } from '#lib/money.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const d = $derived(data.dashboard);
	const amount = (cents: number) => formatMoney(cents, lang());
	const shopUrl = $derived(`${page.url.origin}/s/${data.profile.shop_slug}`);
	const counts = $derived(Object.entries(d.orders_by_status ?? {}).filter(([, n]) => n > 0));
</script>

<svelte:head><title>{t('seller.nav.overview')} · Gebeya</title></svelte:head>

{#if !d.is_verified}
	<Alert tone="info">{t('seller.notVerified')}</Alert>
{/if}

<section class="stats">
	<div class="card stat">
		<span class="muted small">{t('seller.available')}</span>
		<span class="big amount">{amount(d.available_cents)}</span>
	</div>
	<div class="card stat">
		<span class="muted small">{t('seller.balance')}</span>
		<span class="big amount">{amount(d.balance_cents)}</span>
		{#if d.pending_payout_cents > 0}
			<span class="muted small">{t('seller.held')}: {amount(d.pending_payout_cents)}</span>
		{/if}
	</div>
	<div class="card stat">
		<span class="muted small">{t('seller.totalSales')}</span>
		<span class="big amount">{amount(d.total_sales_cents)}</span>
	</div>
	<a
		class="card stat action"
		class:hot={d.orders_action_required > 0}
		href={resolve('/seller/(app)/orders')}
	>
		<span class="muted small">{t('seller.actionRequired')}</span>
		<span class="big">{d.orders_action_required}</span>
	</a>
</section>

{#if counts.length}
	<section class="card row">
		{#each counts as [status, n] (status)}
			<span class="row"><StatusBadge {status} /> <span class="mono">{n}</span></span>
		{/each}
	</section>
{/if}

<section class="card stack-sm">
	<h2>{t('seller.yourLink')}</h2>
	<CopyLink url={shopUrl} />
</section>

<style>
	.stats {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}
	.stat {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.big {
		font-size: 1.3rem;
		font-weight: 700;
	}
	.action {
		color: var(--text);
		text-decoration: none;
	}
	.action.hot {
		border-color: var(--gold);
		background: var(--warn-soft);
	}
</style>
