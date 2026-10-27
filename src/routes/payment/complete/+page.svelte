<script lang="ts">
	import { resolve } from '$app/paths';
	import { refreshAll } from '$app/navigation';
	import Icon from '#lib/components/Icon.svelte';
	import Trust from '#lib/components/Trust.svelte';
	import { lang, t } from '#lib/i18n/index.js';
	import { formatMoney } from '#lib/money.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const order = $derived(data.order);
	const status = $derived(order?.status);
	const failed = $derived(status === 'cancelled' || status === 'refunded');
	const pending = $derived(status === 'pending_payment');

	// Chapa can confirm a few seconds after redirecting back; poll briefly before asking the buyer to retry.
	let checks = $state(0);
	let checking = $state(false);
	$effect(() => {
		if (!pending || checks >= 10) return;
		const timer = setTimeout(async () => {
			checks += 1;
			await refreshAll();
		}, 3000);
		return () => clearTimeout(timer);
	});

	async function checkAgain(e: SubmitEvent) {
		e.preventDefault();
		checking = true;
		try {
			await refreshAll();
		} finally {
			checking = false;
		}
	}
</script>

<svelte:head>
	<title
		>{!order
			? t('pay.unknownTitle')
			: pending
				? t('pay.checking')
				: failed
					? t('pay.failed')
					: t('pay.paid')}
		· {t('brand.name')}</title
	>
</svelte:head>

<div class="narrow vstack pay">
	{#if !order}
		<div class="result" role="alert">
			<span class="result-i unk"><Icon name="help" size={34} /></span>
			<h1 class="t2">{t('pay.unknownTitle')}</h1>
			<p class="body muted pretty">{t('pay.unknown')}</p>
		</div>
		<div class="actions stack">
			<a class="btn btn-primary btn-block" href={resolve('/orders')}>{t('home.myOrders')}</a>
			<a class="btn btn-secondary btn-block" href={resolve('/')}>{t('common.home')}</a>
		</div>
	{:else if pending}
		{@const polling = checks < 10}
		<div class="result" role="status" aria-live="polite">
			{#if polling}
				<span class="result-i wait"><span class="spin lg" aria-hidden="true"></span></span>
				<h1 class="t2">{t('pay.checking')}</h1>
			{:else}
				<span class="result-i wait"><Icon name="clock" size={32} /></span>
				<h1 class="t2">{t('pay.pending')}</h1>
			{/if}
			<p class="body muted pretty">{polling ? t('pay.checkingLead') : t('pay.pendingLead')}</p>
		</div>
		<div class="actions stack">
			<!-- Without JavaScript this reloads the page, which checks with Chapa again. -->
			<form method="GET" class="hstack" onsubmit={checkAgain}>
				<input type="hidden" name="order" value={order.id} />
				<button
					class="btn btn-block {polling ? 'btn-secondary' : 'btn-primary'}"
					class:is-busy={checking}
					disabled={checking}
				>
					<Icon name="refresh" size={18} />{t('pay.retry')}
				</button>
			</form>
			<a
				class="btn btn-block {polling ? 'btn-link' : 'btn-secondary'}"
				href={resolve('/orders/[id]', { id: order.id })}>{t('pay.viewOrder')}</a
			>
		</div>
	{:else if failed}
		<div class="result" role="alert">
			<span class="result-i bad"><Icon name="x" size={32} stroke={2} /></span>
			<p class="foot muted num">{t('order.title', { id: `#${order.id.slice(0, 8)}` })}</p>
			<h1 class="t2">{t('pay.failed')}</h1>
			<p class="body muted pretty">{t('pay.failedLead')}</p>
		</div>
		<div class="actions stack">
			<a class="btn btn-primary btn-block" href={resolve('/orders/[id]', { id: order.id })}
				>{t('pay.viewOrder')}</a
			>
			<a class="btn btn-secondary btn-block" href={resolve('/')}>{t('common.home')}</a>
		</div>
	{:else}
		<div class="result" role="status">
			<span class="result-i ok"><Icon name="check" size={36} stroke={2.25} /></span>
			<p class="foot muted num">{t('order.title', { id: `#${order.id.slice(0, 8)}` })}</p>
			<h1 class="t1">{t('pay.paid')}</h1>
			<p class="t2 num">{formatMoney(order.total_cents, lang())}</p>
		</div>
		<Trust title={t('pay.safe')} text={t('pay.paidLead')} />
		<section class="card next" aria-labelledby="next-h">
			<h2 class="card-t" id="next-h">{t('pay.next')}</h2>
			<ol class="vstack gap-12">
				{#each [t('pay.next1'), t('pay.next2'), t('pay.next3')] as text, i (i)}
					<li class="hstack step-row">
						<span class="num n" aria-hidden="true">{i + 1}</span><span class="callout">{text}</span>
					</li>
				{/each}
			</ol>
		</section>
		<div class="actions stack">
			<a class="btn btn-primary btn-block" href={resolve('/orders/[id]', { id: order.id })}
				>{t('pay.viewOrder')}</a
			>
			<a class="btn btn-secondary btn-block" href={resolve('/')}>{t('common.home')}</a>
		</div>
	{/if}
</div>

<style>
	.vstack.pay {
		gap: 28px;
		padding-top: 24px;
		max-width: 460px;
	}
	.card.next {
		gap: 14px;
	}
	.hstack.step-row {
		align-items: flex-start;
		flex-wrap: nowrap;
		gap: 12px;
	}
	.n {
		display: grid;
		place-items: center;
		flex: none;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--bg);
		font-size: 13px;
		font-weight: 600;
	}
</style>
