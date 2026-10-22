<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { t, type Key } from '#lib/i18n/index.js';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const tabs: { href: string; key: Key }[] = [
		{ href: resolve('/seller/(app)'), key: 'seller.nav.overview' },
		{ href: resolve('/seller/(app)/products'), key: 'seller.nav.products' },
		{ href: resolve('/seller/(app)/orders'), key: 'seller.nav.orders' },
		{ href: resolve('/seller/(app)/wallet'), key: 'seller.nav.wallet' },
		{ href: resolve('/seller/(app)/settings'), key: 'seller.nav.settings' }
	];
	const isActive = (href: string) =>
		href === tabs[0].href ? page.url.pathname === href : page.url.pathname.startsWith(href);
</script>

<div class="stack">
	<div class="stack-sm">
		<p class="muted small">{data.profile.shop_name}</p>
		<nav class="tabs" aria-label={t('nav.shop')}>
			{#each tabs as tab (tab.href)}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- built with resolve() above -->
				<a href={tab.href} aria-current={isActive(tab.href) ? 'page' : undefined}>{t(tab.key)}</a>
			{/each}
		</nav>
	</div>
	{@render children()}
</div>

<style>
	.tabs {
		display: flex;
		gap: 0;
		overflow-x: auto;
		border-bottom: 1px solid var(--border);
		scrollbar-width: none;
	}
	.tabs a {
		padding: 8px 10px;
		color: var(--muted);
		text-decoration: none;
		font-weight: 600;
		font-size: 0.925rem;
		white-space: nowrap;
		border-bottom: 2px solid transparent;
		margin-bottom: -1px;
	}
	.tabs a[aria-current='page'] {
		color: var(--accent);
		border-bottom-color: var(--accent);
	}
</style>
