<script lang="ts">
	import { resolve } from '$app/paths';
	import Pagination from '#lib/components/Pagination.svelte';
	import StatusBadge from '#lib/components/StatusBadge.svelte';
	import { formatDate, t } from '#lib/i18n/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const products = $derived(data.products.items ?? []);
</script>

<svelte:head><title>{t('products.title')} · Gebeya</title></svelte:head>

<div class="spread">
	<h1>{t('products.title')}</h1>
	<a class="btn primary" href={resolve('/seller/(app)/products/new')}>+ {t('products.new')}</a>
</div>

{#if products.length === 0}
	<p class="card muted">{t('products.empty')}</p>
{:else}
	<ul class="list card">
		{#each products as p (p.id)}
			<li>
				<a href={resolve('/seller/(app)/products/[id]', { id: p.id })} class="spread item">
					<span class="stack-sm">
						<span class="name">{p.name}</span>
						<span class="muted small">{formatDate(p.updated_at)}</span>
					</span>
					<StatusBadge status={p.status} prefix="productStatus" />
				</a>
			</li>
		{/each}
	</ul>
	<Pagination page={data.products.page} pages={data.products.total_pages} />
{/if}

<style>
	.item {
		color: var(--text);
		text-decoration: none;
	}
	.name {
		font-weight: 600;
	}
</style>
