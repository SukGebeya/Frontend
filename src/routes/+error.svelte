<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { t } from '#lib/i18n/index.js';
</script>

<svelte:head><title>{page.status} · Gebeya</title></svelte:head>

<section class="card stack">
	<h1>{page.status === 404 ? t('common.notFound') : t('common.error')}</h1>
	{#if page.error?.message && page.status !== 404}
		<p class="muted">{page.error.message}</p>
	{/if}
	<p><a class="btn" href={resolve('/')}>{t('common.home')}</a></p>
</section>
