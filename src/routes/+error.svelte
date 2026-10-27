<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Icon from '#lib/components/Icon.svelte';
	import { t } from '#lib/i18n/index.js';

	const notFound = $derived(page.status === 404);
	// Client errors carry a message meant for the person (e.g. not allowed); server errors get the reassurance.
	const detail = $derived(page.status < 500 && !notFound ? page.error?.message : undefined);
</script>

<svelte:head><title>{page.status} · {t('brand.name')}</title></svelte:head>

<div class="narrow result">
	{#if notFound}
		<p class="num code" aria-hidden="true">404</p>
		<h1 class="t1">{t('common.notFound')}</h1>
		<p class="body muted pretty">{t('common.notFoundLead')}</p>
	{:else}
		<span class="result-i bad"><Icon name="warning" size={32} /></span>
		<h1 class="t1">{t('common.error')}</h1>
		<p class="body muted pretty">{detail ?? t('common.errorLead')}</p>
	{/if}
	<a class="btn btn-primary home" href={resolve('/')}>{t('common.home')}</a>
</div>

<style>
	.narrow.result {
		gap: 16px;
		padding: 40px 0;
	}
	.code {
		font-size: 64px;
		line-height: 68px;
		font-weight: 700;
		letter-spacing: -0.04em;
		color: var(--ink-3);
	}
	.home {
		margin-top: 8px;
	}
</style>
