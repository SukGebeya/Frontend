<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Icon, { type IconName } from './Icon.svelte';
	import type { MerchantProfile } from '#lib/api/types.js';
	import { t, type Key } from '#lib/i18n/index.js';

	let { profile }: { profile: MerchantProfile } = $props();

	const tabs: { href: string; key: Key; icon: IconName }[] = [
		{ href: resolve('/seller/(app)'), key: 'seller.nav.overview', icon: 'grid' },
		{ href: resolve('/seller/(app)/products'), key: 'seller.nav.products', icon: 'box' },
		{ href: resolve('/seller/(app)/orders'), key: 'seller.nav.orders', icon: 'receipt-lines' },
		{ href: resolve('/seller/(app)/wallet'), key: 'seller.nav.wallet', icon: 'wallet' },
		{ href: resolve('/seller/(app)/settings'), key: 'seller.nav.settings', icon: 'sliders' }
	];
	const isActive = (href: string) =>
		href === tabs[0].href ? page.url.pathname === href : page.url.pathname.startsWith(href);
</script>

<nav class="snav" aria-label={t('seller.nav.label')}>
	<div class="snav-shop">
		<div class="snav-name">
			<span class="snav-title">{profile.shop_name}</span>
			{#if profile.is_verified}
				<span class="verified"><Icon name="check-circle" size={16} />{t('seller.verified')}</span>
			{:else}
				<span class="foot faint">{t('seller.nav.notVerified')}</span>
			{/if}
		</div>
		<a class="btn btn-secondary btn-sm" href={resolve('/s/[shop]', { shop: profile.shop_slug })}
			>{t('seller.nav.viewShop')}<Icon name="external" size={16} /></a
		>
	</div>
	<div class="snav-tabs">
		{#each tabs as tab (tab.href)}
			{@const on = isActive(tab.href)}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- built with resolve() above -->
			<a class="stab" class:is-on={on} href={tab.href} aria-current={on ? 'page' : undefined}>
				<Icon name={tab.icon} size={22} />
				<span>{t(tab.key)}</span>
			</a>
		{/each}
	</div>
</nav>
