<script lang="ts">
	import { resolve } from '$app/paths';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Pagination from '#lib/components/Pagination.svelte';
	import StatusBadge from '#lib/components/StatusBadge.svelte';
	import { formatDate, t } from '#lib/i18n/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const products = $derived(data.products.items ?? []);
</script>

<svelte:head><title>{t('products.title')} · {t('brand.name')}</title></svelte:head>

<div class="hstack between head">
	<h1 class="t1">{t('products.title')}</h1>
	{#if products.length}
		<a class="btn btn-primary btn-sm" href={resolve('/seller/(app)/products/new')}
			><Icon name="plus" size={16} />{t('products.new')}</a
		>
	{/if}
</div>

{#if products.length === 0}
	<EmptyState icon="box" title={t('products.emptyTitle')} text={t('products.emptyLead')}>
		<a class="btn btn-primary btn-sm" href={resolve('/seller/(app)/products/new')}
			><Icon name="plus" size={16} />{t('products.new')}</a
		>
	</EmptyState>
{:else}
	<div class="list">
		{#each products as p (p.id)}
			<a class="lrow" href={resolve('/seller/(app)/products/[id]', { id: p.id })}>
				<!-- The merchant product list has no image or price yet (see the design README). -->
				<span class="thumb-s" aria-hidden="true"><Icon name="image" /></span>
				<div class="lrow-main">
					<span class="lrow-t">{p.name}</span>
					<span class="lrow-s num"
						>{t('products.updated', { date: formatDate(p.updated_at, true) })}</span
					>
				</div>
				<div class="lrow-end"><StatusBadge status={p.status} prefix="productStatus" /></div>
				<Icon name="chevron-right" size={18} class="chev" />
			</a>
		{/each}
	</div>
	<Pagination page={data.products.page} pages={data.products.total_pages} />
{/if}

<style>
	.hstack.head {
		gap: 12px;
		flex-wrap: nowrap;
	}
</style>
