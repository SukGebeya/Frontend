<script lang="ts">
	import { page as current } from '$app/state';
	import { t } from '#lib/i18n/index.js';

	let { page, pages }: { page: number; pages: number } = $props();

	function href(n: number) {
		const url = new URL(current.url.href);
		url.searchParams.set('page', String(n));
		return url.pathname + url.search;
	}
</script>

{#if pages > 1}
	<nav class="spread" aria-label="Pagination">
		{#if page > 1}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- same page, only ?page changes -->
			<a class="btn sm" href={href(page - 1)}>{t('common.previous')}</a>
		{:else}
			<span></span>
		{/if}
		<span class="muted small">{t('common.pageOf', { page, pages })}</span>
		{#if page < pages}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- same page, only ?page changes -->
			<a class="btn sm" href={href(page + 1)}>{t('common.next')}</a>
		{:else}
			<span></span>
		{/if}
	</nav>
{/if}
