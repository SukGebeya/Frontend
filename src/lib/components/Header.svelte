<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Icon from './Icon.svelte';
	import type { User } from '#lib/api/types.js';
	import { t, type Lang } from '#lib/i18n/index.js';

	let { user, lang, cartCount }: { user: User | null; lang: Lang; cartCount: number } = $props();

	let menu = $state<HTMLDetailsElement>();
	afterNavigate(() => {
		if (menu) menu.open = false;
	});

	const here = $derived(page.url.pathname + page.url.search);
	const path = $derived(page.url.pathname);
	const other = $derived(lang === 'am' ? 'en' : 'am');
	const isSeller = $derived(user?.role === 'merchant');
	const cartLabel = $derived(
		cartCount === 0
			? t('nav.cart')
			: cartCount === 1
				? t('nav.cartOne')
				: t('nav.cartMany', { n: cartCount })
	);
</script>

<header class="hdr">
	<div class="wrap hdr-in">
		<a class="logo" href={resolve('/')} aria-label={t('brand.home')}>
			<span class="logo-m" aria-hidden="true">ገ</span>
			<span>{t('brand.name')}</span>
		</a>
		{#if user}
			<div class="wide-only">
				<a
					class="navlink"
					class:is-on={path.startsWith('/orders')}
					href={resolve('/orders')}
					aria-current={path === '/orders' ? 'page' : undefined}>{t('nav.orders')}</a
				>
				{#if isSeller}
					<a
						class="navlink"
						class:is-on={path.startsWith('/seller')}
						href={resolve('/seller/(app)')}>{t('nav.shop')}</a
					>
				{:else}
					<a
						class="navlink"
						class:is-on={path.startsWith('/seller')}
						href={resolve('/seller/onboard')}>{t('nav.openShop')}</a
					>
				{/if}
			</div>
		{/if}
		<form method="POST" action="/lang">
			<input type="hidden" name="lang" value={other} />
			<input type="hidden" name="next" value={here} />
			<button class="navlink" lang={other}>{t('nav.switchLang')}</button>
		</form>
		<a class="ibtn" href={resolve('/cart')} aria-label={cartLabel}>
			<Icon name="bag" size={22} />
			{#if cartCount > 0}<span class="count" aria-hidden="true">{cartCount}</span>{/if}
		</a>
		{#if !user}
			<a
				class="btn btn-primary btn-sm login"
				href={resolve(`/login?next=${encodeURIComponent(here)}`)}>{t('nav.login')}</a
			>
		{:else}
			<div class="narrow-only">
				<details class="menu" bind:this={menu}>
					<summary class="ibtn" aria-label={t('nav.menu')}><Icon name="menu" size={22} /></summary>
					<div class="menu-p">
						<a href={resolve('/orders')}><Icon name="receipt-lines" />{t('nav.orders')}</a>
						{#if isSeller}
							<a href={resolve('/seller/(app)')}><Icon name="store" />{t('nav.shop')}</a>
						{:else}
							<a href={resolve('/seller/onboard')}><Icon name="store" />{t('nav.openShop')}</a>
						{/if}
					</div>
				</details>
			</div>
		{/if}
	</div>
</header>

<style>
	form {
		display: contents;
	}
	.login {
		margin-left: 6px;
	}
</style>
