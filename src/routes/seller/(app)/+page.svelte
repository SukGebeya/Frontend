<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Alert from '#lib/components/Alert.svelte';
	import CopyLink from '#lib/components/CopyLink.svelte';
	import StatusBadge from '#lib/components/StatusBadge.svelte';
	import { lang, t, tv } from '#lib/i18n/index.js';
	import { currency, formatAmount, formatMoney } from '#lib/money.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const d = $derived(data.dashboard);
	const kyc = $derived(page.data.user?.kyc_status ?? 'pending');
	const shopUrl = $derived(`${page.url.origin}/s/${data.profile.shop_slug}`);
	// In the order a shop works through them.
	const statuses = [
		'paid',
		'processing',
		'shipped',
		'delivered',
		'disputed',
		'cancelled',
		'refunded'
	];
	const counts = $derived(
		statuses.map((s) => [s, d.orders_by_status?.[s] ?? 0] as const).filter(([, n]) => n > 0)
	);
	const kycTone: Record<string, string> = {
		submitted: 'b-info',
		verified: 'b-success',
		rejected: 'b-danger'
	};
</script>

<svelte:head><title>{t('seller.nav.overview')} · {t('brand.name')}</title></svelte:head>

{#snippet money(cents: number)}{formatAmount(cents)}<small> {currency(lang())}</small>{/snippet}

<h1 class="t1">{t('seller.nav.overview')}</h1>

{#if !d.is_verified || kyc !== 'verified'}
	<Alert tone="info" title={t('seller.payoutsLocked')}>
		<span>{t('seller.payoutsLockedLead')}</span>
		<span class="hstack gap-6 checks">
			<span class="badge" class:b-success={d.is_verified}
				>{d.is_verified ? t('seller.shopVerified') : t('seller.shopNotVerified')}</span
			>
			<span class="badge {kycTone[kyc] ?? ''}">{tv('kyc', kyc)}</span>
		</span>
	</Alert>
{/if}

<div class="stats">
	<a class="stat" class:hi={d.orders_action_required > 0} href={resolve('/seller/(app)/orders')}>
		<span class="stat-l">{t('seller.actionRequired')}</span>
		<span class="stat-v">{d.orders_action_required}</span>
		<span class="stat-s">{t('seller.toOrders')}</span>
	</a>
	<a class="stat" href={resolve('/seller/(app)/wallet')}>
		<span class="stat-l">{t('seller.available')}</span>
		<span class="stat-v">{@render money(d.available_cents)}</span>
		<span class="stat-s">{t('seller.toWallet')}</span>
	</a>
	<div class="stat">
		<span class="stat-l">{t('seller.balance')}</span>
		<span class="stat-v">{@render money(d.balance_cents)}</span>
		{#if d.pending_payout_cents > 0}
			<span class="stat-s"
				>{t('seller.heldAmount', { amount: formatMoney(d.pending_payout_cents, lang()) })}</span
			>
		{/if}
	</div>
	<div class="stat">
		<span class="stat-l">{t('seller.totalSales')}</span>
		<span class="stat-v">{@render money(d.total_sales_cents)}</span>
	</div>
</div>

<div class="split half">
	<section class="card by-status" aria-labelledby="ost-h">
		<div class="card-h">
			<h2 class="card-t" id="ost-h">{t('seller.byStatus')}</h2>
			<a class="btn btn-link btn-sm" href={resolve('/seller/(app)/orders')}
				>{t('seller.allOrders')}</a
			>
		</div>
		{#if counts.length}
			<div class="rows">
				{#each counts as [status, n] (status)}
					<a class="row" href={resolve('/seller/(app)/orders')}>
						<StatusBadge {status} />
						<span class="callout strong num">{n}</span>
					</a>
				{/each}
			</div>
		{:else}
			<p class="callout muted">{t('sorders.emptyLead')}</p>
		{/if}
	</section>

	<section class="card" aria-labelledby="share-h">
		<div class="vstack gap-4">
			<h2 class="card-t" id="share-h">{t('seller.shareTitle')}</h2>
			<p class="foot muted">{t('seller.shareLead')}</p>
		</div>
		<CopyLink url={shopUrl} label={t('seller.shopLink')} />
	</section>
</div>

<style>
	.checks {
		padding-top: 6px;
	}
	.checks .badge {
		background: var(--surface);
	}
	.split.half {
		gap: 16px;
	}
	.card.by-status {
		padding-bottom: 8px;
	}
	.rows {
		display: flex;
		flex-direction: column;
		margin: 0 -4px;
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-height: 48px;
		padding: 0 4px;
		border-top: 1px solid var(--line);
		color: var(--ink);
		text-decoration: none;
	}
</style>
