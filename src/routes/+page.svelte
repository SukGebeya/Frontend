<script lang="ts">
	import { resolve } from '$app/paths';
	import { t } from '#lib/i18n/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const isSeller = $derived(data.user?.role === 'merchant');
</script>

<svelte:head><title>Gebeya · {t('brand.tagline')}</title></svelte:head>

<section class="hero stack">
	<h1>{t('home.title')}</h1>
	<p class="lead">{t('home.lead')}</p>
	<div class="row">
		<a class="btn primary" href={resolve('/seller/(app)')}
			>{isSeller ? t('home.goToShop') : t('home.openShop')}</a
		>
		<a class="btn" href={resolve('/orders')}>{t('home.myOrders')}</a>
	</div>
</section>

<ol class="steps">
	{#each [1, 2, 3] as n (n)}
		<li class="card">
			<span class="num" aria-hidden="true">{n}</span>
			<h2>{t(`home.step${n}.title` as 'home.step1.title')}</h2>
			<p class="muted">{t(`home.step${n}.body` as 'home.step1.body')}</p>
		</li>
	{/each}
</ol>

<style>
	.hero {
		padding: 24px 0 28px;
	}
	.hero h1 {
		font-size: clamp(1.75rem, 6vw, 2.4rem);
		letter-spacing: -0.01em;
	}
	.lead {
		font-size: 1.075rem;
		color: var(--muted);
		max-width: 38rem;
	}
	.steps {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 12px;
	}
	@media (min-width: 640px) {
		.steps {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	.steps li {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.num {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--accent-soft);
		color: var(--success-ink);
		font-weight: 700;
	}
</style>
