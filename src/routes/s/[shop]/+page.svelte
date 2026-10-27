<script lang="ts">
	import { resolve } from '$app/paths';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Img from '#lib/components/Img.svelte';
	import Pagination from '#lib/components/Pagination.svelte';
	import { lang, t, tSplit } from '#lib/i18n/index.js';
	import { formatMoney } from '#lib/money.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const shop = $derived(data.shop);
	const items = $derived(data.products.items ?? []);
	const amount = (cents: number) => formatMoney(cents, lang());
	const from = $derived(tSplit('products.from', 'price'));
</script>

<svelte:head><title>{shop.shop_name} · {t('brand.name')}</title></svelte:head>

<div class="vstack gap-40">
	<section class="vstack intro">
		<span class="mark" aria-hidden="true">{shop.shop_name.slice(0, 1).toUpperCase()}</span>
		<div class="vstack gap-8">
			<h1 class="t1">{shop.shop_name}</h1>
			{#if shop.is_verified}
				<span class="verified"><Icon name="check-circle" size={16} />{t('product.verified')}</span>
			{/if}
		</div>
		{#if shop.description}<p class="body muted pretty">{shop.description}</p>{/if}
		<div class="hstack">
			{#if shop.city}
				<span class="badge plain chip"><Icon name="pin" size={16} />{shop.city}</span>
			{/if}
			<span class="badge plain chip num"
				><Icon name="truck" size={16} />{t('shop.delivery', {
					amount: amount(shop.delivery_fee_cents)
				})}</span
			>
			{#if shop.free_delivery_threshold_cents != null}
				<span class="badge plain chip num"
					>{t('shop.freeOver', { amount: amount(shop.free_delivery_threshold_cents) })}</span
				>
			{/if}
		</div>
	</section>

	<section class="vstack gap-20" aria-labelledby="products-h">
		<div class="hstack between head">
			<h2 class="t2" id="products-h">{t('shop.products')}</h2>
			{#if items.length}
				<span class="sub muted num">{t('shop.count', { n: data.products.total })}</span>
			{/if}
		</div>

		{#if items.length === 0}
			<EmptyState icon="box" level={3} title={t('shop.empty')} text={t('shop.emptyLead')}>
				<a class="btn btn-secondary btn-sm" href={resolve('/')}>{t('common.home')}</a>
			</EmptyState>
		{:else}
			<div class="tiles">
				{#each items as p (p.id)}
					<a class="tile" class:is-out={!p.in_stock} href={resolve('/p/[slug]', { slug: p.slug })}>
						<span class="ph tile-img">
							<Img src={p.primary_image_url} size={32} />
							{#if !p.in_stock}<span class="tile-flag badge plain">{t('product.outOfStock')}</span
								>{/if}
						</span>
						<span class="tile-b">
							<span class="tile-name">{p.name}</span>
							<span class="tile-price"
								><span class="from">{from[0]}</span>{amount(p.min_price_cents)}<span class="from"
									>{from[1]}</span
								></span
							>
						</span>
					</a>
				{/each}
			</div>
			<Pagination page={data.products.page} pages={data.products.total_pages} />
		{/if}
	</section>
</div>

<style>
	.vstack.intro {
		max-width: 680px;
	}
	.mark {
		display: grid;
		place-items: center;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: var(--bg-2);
		font-size: 26px;
		font-weight: 700;
		letter-spacing: -0.02em;
	}
	.badge.chip {
		height: 32px;
		padding: 0 12px;
		gap: 6px;
	}
	.from {
		color: var(--ink-2);
		font-weight: 500;
	}
	.hstack.head {
		align-items: baseline;
		gap: 12px;
	}
</style>
