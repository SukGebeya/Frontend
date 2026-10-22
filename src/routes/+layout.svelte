<script lang="ts">
	import { resolve } from '$app/paths';
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { t } from '#lib/i18n/index.js';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const here = $derived(page.url.pathname + page.url.search);
	const isSeller = $derived(data.user?.role === 'merchant');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Gebeya</title>
</svelte:head>

<a class="skip sr-only" href="#main">Skip to content</a>

<header class="site">
	<div class="container bar">
		<a class="brand" href={resolve('/')} aria-label="Gebeya home">
			<span class="mark" aria-hidden="true">ገ</span>
			<span>Gebeya</span>
		</a>
		<nav class="row" aria-label="Main">
			{#if data.user}
				<a href={resolve('/orders')}>{t('nav.orders')}</a>
				{#if isSeller}
					<a href={resolve('/seller/(app)')}>{t('nav.shop')}</a>
				{/if}
			{:else}
				<a href={resolve(`/login?next=${encodeURIComponent(here)}`)}>{t('nav.login')}</a>
			{/if}
			<a href={resolve('/cart')} aria-label={t('nav.cart')}>{t('nav.cart')}</a>
			<form method="POST" action="/lang">
				<input type="hidden" name="lang" value={data.lang === 'am' ? 'en' : 'am'} />
				<input type="hidden" name="next" value={here} />
				<button class="btn link" lang={data.lang === 'am' ? 'en' : 'am'}
					>{t('nav.switchLang')}</button
				>
			</form>
		</nav>
	</div>
</header>

<main id="main" class="container">
	{@render children()}
</main>

<footer class="container muted small">
	<p>{t('brand.tagline')}</p>
	{#if data.user}
		<form method="POST" action="/logout">
			<button class="btn link">{t('nav.logout')}</button>
		</form>
	{/if}
</footer>

<style>
	.skip:focus {
		position: fixed;
		top: 8px;
		left: 8px;
		width: auto;
		height: auto;
		clip: auto;
		padding: 8px 12px;
		background: var(--surface);
		z-index: 10;
	}
	header.site {
		background: var(--surface);
		border-bottom: 1px solid var(--border);
		position: sticky;
		top: 0;
		z-index: 5;
	}
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-height: 56px;
		flex-wrap: wrap;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 800;
		font-size: 1.1rem;
		color: var(--text);
		text-decoration: none;
	}
	.mark {
		display: grid;
		place-items: center;
		width: 30px;
		height: 30px;
		border-radius: 8px;
		background: var(--accent);
		color: var(--accent-ink);
		font-size: 1rem;
	}
	nav {
		gap: 14px;
		font-size: 0.95rem;
	}
	nav a {
		color: var(--text);
		text-decoration: none;
		font-weight: 500;
	}
	nav a:hover {
		color: var(--accent);
	}
	main {
		padding-top: 20px;
		padding-bottom: 32px;
	}
	footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
		padding-top: 16px;
		padding-bottom: 32px;
		border-top: 1px solid var(--border);
	}
</style>
