<script lang="ts">
	import { page as current } from '$app/state';
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n/index.js';

	let { page, pages }: { page: number; pages: number } = $props();

	function href(n: number) {
		const url = new URL(current.url.href);
		url.searchParams.set('page', String(n));
		return url.pathname + url.search;
	}
</script>

{#if pages > 1}
	<nav class="pager" aria-label={t('common.pages')}>
		{#if page > 1}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- same page, only ?page changes -->
			<a class="btn btn-secondary btn-sm" href={href(page - 1)}
				><Icon name="chevron-left" size={16} />{t('common.previous')}</a
			>
		{:else}
			<span class="btn btn-secondary btn-sm" aria-disabled="true"
				><Icon name="chevron-left" size={16} />{t('common.previous')}</span
			>
		{/if}
		<span class="pager-l">{t('common.pageOf', { page, pages })}</span>
		{#if page < pages}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- same page, only ?page changes -->
			<a class="btn btn-secondary btn-sm" href={href(page + 1)}
				>{t('common.next')}<Icon name="chevron-right" size={16} /></a
			>
		{:else}
			<span class="btn btn-secondary btn-sm" aria-disabled="true"
				>{t('common.next')}<Icon name="chevron-right" size={16} /></span
			>
		{/if}
	</nav>
{/if}
