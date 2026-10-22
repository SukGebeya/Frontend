<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { lang, t } from '#lib/i18n/index.js';
	import { formatMoney } from '#lib/money.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const f = $derived(formState(form));
	const s = submitting();

	const product = $derived(data.detail.product);
	const shop = $derived(data.detail.shop);
	const variants = $derived((data.detail.variants ?? []).filter((v) => v.is_active));
	const images = $derived(
		[...(data.detail.images ?? [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
	);

	let selectedId = $state('');
	let quantity = $state(1);
	const selected = $derived(
		variants.find((v) => v.id === selectedId) ??
			variants.find((v) => (v.available_quantity ?? 0) > 0) ??
			variants[0]
	);
	const available = $derived(selected?.available_quantity ?? 0);
	const amount = (cents: number) => formatMoney(cents, lang());
</script>

<svelte:head>
	<title>{product.name} · Gebeya</title>
	<meta property="og:title" content={product.name} />
	{#if selected}<meta property="og:description" content={amount(selected.price_cents)} />{/if}
	{#if images[0]}<meta property="og:image" content={images[0].url} />{/if}
</svelte:head>

<article class="stack">
	{#if images.length}
		<div class="gallery" class:single={images.length === 1}>
			{#each images as image, i (image.id)}
				<img
					src={image.url}
					alt={image.alt_text ?? product.name}
					loading={i === 0 ? 'eager' : 'lazy'}
				/>
			{/each}
		</div>
	{/if}

	<header class="stack-sm">
		<h1>{product.name}</h1>
		{#if selected}
			<p class="price">
				<span class="amount">{amount(selected.price_cents)}</span>
				{#if selected.compare_price_cents && selected.compare_price_cents > selected.price_cents}
					<s class="muted">{amount(selected.compare_price_cents)}</s>
				{/if}
			</p>
		{/if}
	</header>

	{#if product.description}
		<p class="description">{product.description}</p>
	{/if}

	<FormMessage form={f} />

	{#if variants.length === 0}
		<p class="card muted">{t('product.noVariants')}</p>
	{:else}
		<form method="POST" action="?/buy" class="card stack" use:enhance={s.submit}>
			{#if variants.length > 1}
				<fieldset class="stack-sm">
					<legend class="label">{t('product.option')}</legend>
					<div class="options">
						{#each variants as v (v.id)}
							<label class="option" class:active={selected?.id === v.id}>
								<input
									type="radio"
									name="variant_id"
									value={v.id}
									checked={selected?.id === v.id}
									disabled={(v.available_quantity ?? 0) === 0}
									onchange={() => (selectedId = v.id)}
								/>
								<span>{v.title}</span>
								<span class="muted small">{amount(v.price_cents)}</span>
							</label>
						{/each}
					</div>
				</fieldset>
			{:else}
				<input type="hidden" name="variant_id" value={selected?.id} />
			{/if}

			{#if available > 0}
				<div class="spread">
					<label class="label" for="quantity">{t('product.quantity')}</label>
					<div class="row">
						<input
							id="quantity"
							name="quantity"
							type="number"
							min="1"
							max={Math.min(available, 100)}
							bind:value={quantity}
							class="qty"
						/>
						{#if available <= 5}<span class="muted small"
								>{t('product.left', { n: available })}</span
							>{/if}
					</div>
				</div>
				<button class="btn primary block" disabled={s.busy}>{t('product.buyNow')}</button>
				<button class="btn block" formaction="?/add" disabled={s.busy}
					>{t('product.addToCart')}</button
				>
			{:else}
				<p class="muted">{t('product.outOfStock')}</p>
			{/if}
		</form>
	{/if}

	{#if shop}
		<section class="card stack-sm">
			<div class="spread">
				<div>
					<p class="muted small">{t('product.soldBy')}</p>
					<a href={resolve('/s/[shop]', { shop: shop.shop_slug })} class="shop-name"
						>{shop.shop_name}</a
					>
				</div>
				{#if shop.is_verified}<span class="verified">✓ {t('product.verified')}</span>{/if}
			</div>
			<dl class="kv">
				<dt>{t('product.delivery')}</dt>
				<dd>{amount(shop.delivery_fee_cents)}</dd>
			</dl>
			{#if shop.free_delivery_threshold_cents != null}
				<p class="muted small">
					{t('product.freeOver', { amount: amount(shop.free_delivery_threshold_cents) })}
				</p>
			{/if}
		</section>
	{/if}

	<aside class="protection stack-sm">
		<h2>🛡 {t('product.protection')}</h2>
		<p>{t('product.protectionBody')}</p>
	</aside>
</article>

<style>
	.gallery {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 85%;
		gap: 8px;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		border-radius: var(--radius);
	}
	.gallery.single {
		grid-auto-columns: 100%;
	}
	.gallery img {
		width: 100%;
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: var(--radius);
		scroll-snap-align: start;
		background: var(--surface-2);
	}
	.price {
		font-size: 1.35rem;
		display: flex;
		gap: 10px;
		align-items: baseline;
	}
	.description {
		white-space: pre-line;
	}
	fieldset {
		border: 0;
		padding: 0;
		margin: 0;
	}
	.options {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.option {
		position: relative;
		display: flex;
		flex-direction: column;
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		cursor: pointer;
	}
	.option input {
		position: absolute;
		opacity: 0;
	}
	.option.active {
		border-color: var(--accent);
		box-shadow: inset 0 0 0 1px var(--accent);
	}
	.option:has(input:disabled) {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.option:has(input:focus-visible) {
		outline: 3px solid color-mix(in srgb, var(--accent) 55%, transparent);
	}
	.qty {
		width: 5.5rem;
	}
	.shop-name {
		font-weight: 700;
		font-size: 1.05rem;
	}
	.verified {
		color: var(--success-ink);
		font-weight: 600;
		font-size: 0.9rem;
	}
	.protection {
		background: var(--accent-soft);
		border-radius: var(--radius);
		padding: 16px;
	}
	.protection h2 {
		font-size: 1rem;
	}
</style>
