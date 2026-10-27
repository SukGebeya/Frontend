<script lang="ts">
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import inter from '#lib/assets/fonts/inter-latin.woff2';
	import Footer from '#lib/components/Footer.svelte';
	import Header from '#lib/components/Header.svelte';
	import { t } from '#lib/i18n/index.js';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preload" href={inter} as="font" type="font/woff2" crossorigin="anonymous" />
	<title>{t('brand.name')}</title>
</svelte:head>

<div class="g page">
	<a class="skip" href="#main">{t('nav.skip')}</a>
	<Header user={data.user} lang={data.lang} cartCount={data.cartCount} />
	<main id="main" class="main" tabindex="-1">
		<div class="wrap">
			{@render children()}
		</div>
	</main>
	<Footer signedIn={!!data.user} />
</div>
