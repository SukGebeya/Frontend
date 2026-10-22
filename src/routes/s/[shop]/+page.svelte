<script lang="ts">
	import { resolve } from '$app/paths';
	import Pagination from '#lib/components/Pagination.svelte';
	import { lang, t } from '#lib/i18n/index.js';
	import { formatMoney } from '#lib/money.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const shop = $derived(data.shop);
	const items = $derived(data.products.items ?? []);
</script>

<svelte:head><title>{shop.shop_name} · Gebeya</title></svelte:head>

<section class="stack">
	<header class="stack-sm">
		<div class="row">
			<h1>{shop.shop_name}</h1>
			{#if shop.is_verified}<span class="verified">✓ {t('product.verified')}</span>{/if}
		</div>
		{#if shop.description}<p class="muted">{shop.description}</p>{/if}
		<p class="small muted">
			{shop.city} · {t('product.delivery')}
			{formatMoney(shop.delivery_fee_cents, lang())}
		</p>
	</header>

	<h2>{t('shop.products')}</h2>
	{#if items.length === 0}
		<p class="muted">{t('shop.empty')}</p>
	{:else}
		<ul class="grid">
			{#each items as p (p.id)}
				<li>
					<a href={resolve('/p/[slug]', { slug: p.slug })} class="card tile">
						{#if p.primary_image_url}
							<img src={p.primary_image_url} alt="" loading="lazy" />
						{:else}
							<div class="placeholder" aria-hidden="true">ገ</div>
						{/if}
						<span class="name">{p.name}</span>
						<span class="amount"
							>{t('products.from', { price: formatMoney(p.min_price_cents, lang()) })}</span
						>
						{#if !p.in_stock}<span class="muted small">{t('product.outOfStock')}</span>{/if}
					</a>
				</li>
			{/each}
		</ul>
		<Pagination page={data.products.page} pages={data.products.total_pages} />
	{/if}
</section>

<style>
	.verified {
		color: var(--success-ink);
		font-weight: 600;
		font-size: 0.9rem;
	}
	.grid {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}
	@media (min-width: 640px) {
		.grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	.tile {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 8px;
		color: var(--text);
		text-decoration: none;
		height: 100%;
	}
	.tile img,
	.placeholder {
		width: 100%;
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: var(--radius-sm);
		background: var(--surface-2);
	}
	.placeholder {
		display: grid;
		place-items: center;
		font-size: 2rem;
		color: var(--muted);
	}
	.name {
		font-weight: 600;
	}
</style>
