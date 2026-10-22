<script lang="ts">
	import { resolve } from '$app/paths';
	import { refreshAll } from '$app/navigation';
	import { t } from '#lib/i18n/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const status = $derived(data.order?.status);
	const failed = $derived(status === 'cancelled' || status === 'refunded');
	const pending = $derived(status === 'pending_payment');

	// Chapa can confirm a few seconds after redirecting back; poll briefly before asking the buyer to retry.
	let checks = $state(0);
	$effect(() => {
		if (!pending || checks >= 10) return;
		const timer = setTimeout(async () => {
			checks += 1;
			await refreshAll();
		}, 3000);
		return () => clearTimeout(timer);
	});
</script>

<svelte:head><title>{t('pay.paid')} · Gebeya</title></svelte:head>

<section class="card stack center" aria-live="polite">
	{#if !data.order}
		<h1>{t('pay.unknown')}</h1>
		<p><a class="btn" href={resolve('/orders')}>{t('orders.title')}</a></p>
	{:else if pending}
		<div class="icon wait" aria-hidden="true">…</div>
		<h1>{checks < 10 ? t('pay.checking') : t('pay.pending')}</h1>
		<p class="muted">{t('pay.pendingLead')}</p>
		<div class="row centered">
			<button class="btn" onclick={() => refreshAll()}>{t('pay.retry')}</button>
			<a class="btn" href={resolve('/orders/[id]', { id: data.order.id })}>{t('pay.viewOrder')}</a>
		</div>
	{:else if failed}
		<div class="icon bad" aria-hidden="true">✕</div>
		<h1>{t('pay.failed')}</h1>
		<p class="muted">{t('pay.failedLead')}</p>
		<p>
			<a class="btn" href={resolve('/orders/[id]', { id: data.order.id })}>{t('pay.viewOrder')}</a>
		</p>
	{:else}
		<div class="icon good" aria-hidden="true">✓</div>
		<h1>{t('pay.paid')}</h1>
		<p class="muted">{t('pay.paidLead')}</p>
		<p>
			<a class="btn primary" href={resolve('/orders/[id]', { id: data.order.id })}
				>{t('pay.viewOrder')}</a
			>
		</p>
	{/if}
</section>

<style>
	.center {
		text-align: center;
		align-items: center;
		padding: 32px 16px;
	}
	.centered {
		justify-content: center;
	}
	.icon {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		font-size: 1.6rem;
		font-weight: 700;
	}
	.good {
		background: var(--accent-soft);
		color: var(--success-ink);
	}
	.bad {
		background: var(--danger-soft);
		color: var(--danger);
	}
	.wait {
		background: var(--info-soft);
		color: var(--info-ink);
	}
</style>
