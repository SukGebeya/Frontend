<script lang="ts">
	import { resolve } from '$app/paths';
	import Icon from '#lib/components/Icon.svelte';
	import OrderProgress from '#lib/components/OrderProgress.svelte';
	import { lang, t } from '#lib/i18n/index.js';
	import { formatMoney } from '#lib/money.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const isSeller = $derived(data.user?.role === 'merchant');
</script>

<svelte:head><title>{t('brand.name')} · {t('brand.tagline')}</title></svelte:head>

<div class="vstack home">
	<section class="split half hero">
		<div class="vstack gap-20">
			<p class="eyebrow accent">{t('brand.tagline')}</p>
			<h1 class="display">{t('home.title')}</h1>
			<p class="t3 muted pretty lead">{t('home.lead')}</p>
			<div class="actions">
				{#if isSeller}
					<a class="btn btn-primary btn-fluid" href={resolve('/seller/(app)')}
						>{t('home.goToShop')}</a
					>
				{:else}
					<a class="btn btn-primary btn-fluid" href={resolve('/seller/onboard')}
						>{t('home.openShop')}</a
					>
				{/if}
				<a class="btn btn-secondary btn-fluid" href={resolve('/orders')}>{t('home.myOrders')}</a>
			</div>
		</div>

		<figure class="demo" aria-label={t('home.demo.label')}>
			<div class="demo-order">
				<div class="demo-head">
					<span class="trust-i"><Icon name="shield" /></span>
					<div class="vstack gap-2">
						<span class="foot muted">{t('home.demo.held')}</span>
						<span class="t3 num">{formatMoney(265000, lang())}</span>
						<span class="foot muted">{t('home.demo.item')}</span>
					</div>
				</div>
				<OrderProgress status="shipped" />
			</div>
			<div class="demo-wallet">
				<span class="demo-icon"><Icon name="wallet" size={18} /></span>
				<span class="sub muted pretty">{t('home.demo.wallet')}</span>
			</div>
		</figure>
	</section>

	<section class="vstack gap-28" aria-labelledby="how-h">
		<h2 class="t1" id="how-h">{t('home.how')}</h2>
		<ol class="how">
			{#each [1, 2, 3] as n (n)}
				<li class="card">
					<span class="num step-n" aria-hidden="true">{n}</span>
					<h3 class="t3">{t(`home.step${n}.title` as 'home.step1.title')}</h3>
					<p class="callout muted pretty">{t(`home.step${n}.body` as 'home.step1.body')}</p>
				</li>
			{/each}
		</ol>
	</section>
</div>

<style>
	.vstack.home {
		gap: 72px;
	}
	.split.hero {
		align-items: center;
		gap: 48px;
		padding-top: 20px;
	}
	.eyebrow.accent {
		color: var(--accent);
	}
	.t3.lead {
		font-weight: 400;
		line-height: 28px;
	}
	.actions {
		padding-top: 8px;
	}
	.demo {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 20px;
		border-radius: var(--r-xl);
		background: var(--bg-2);
	}
	.demo-order {
		display: flex;
		flex-direction: column;
		gap: 18px;
		padding: 20px;
		border-radius: 20px;
		background: var(--surface);
		box-shadow: var(--sh-1);
	}
	.demo-head {
		display: flex;
		align-items: flex-start;
		gap: 12px;
	}
	.demo-wallet {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 20px;
		border-radius: 20px;
		background: var(--surface);
	}
	.demo-icon {
		display: grid;
		place-items: center;
		flex: none;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--bg-2);
	}
	.how {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
		gap: 16px;
	}
	.how .card {
		gap: 12px;
	}
	.step-n {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--primary);
		color: var(--on-primary);
		font-size: 15px;
		font-weight: 700;
	}
</style>
