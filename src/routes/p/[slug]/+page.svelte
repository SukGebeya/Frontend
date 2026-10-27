<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import Alert from '#lib/components/Alert.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import Gallery from '#lib/components/Gallery.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Quantity from '#lib/components/Quantity.svelte';
	import Submit from '#lib/components/Submit.svelte';
	import Trust from '#lib/components/Trust.svelte';
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
		[...(data.detail.images ?? [])].sort(
			(a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order
		)
	);

	let selectedId = $state('');
	const selected = $derived(
		variants.find((v) => v.id === selectedId) ??
			variants.find((v) => (v.available_quantity ?? 0) > 0) ??
			variants[0]
	);
	const available = $derived(selected?.available_quantity ?? 0);
	const amount = (cents: number) => formatMoney(cents, lang());
	const shopHref = $derived(shop ? resolve('/s/[shop]', { shop: shop.shop_slug }) : undefined);
</script>

<svelte:head>
	<title>{product.name} · {t('brand.name')}</title>
	<meta property="og:title" content={product.name} />
	{#if selected}<meta property="og:description" content={amount(selected.price_cents)} />{/if}
	{#if images[0]}<meta property="og:image" content={images[0].url} />{/if}
</svelte:head>

<div class="vstack gap-48">
	<div class="split">
		<Gallery {images} name={product.name} />

		<div class="vstack gap-24">
			{#if f.notice === 'product.added'}
				<Alert tone="success" title={t('product.added')}>
					<span><a href={resolve('/cart')}>{t('product.viewCart')}</a></span>
				</Alert>
			{:else}
				<FormMessage form={f} />
			{/if}

			<div class="vstack gap-8">
				{#if shop}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- built with resolve() above -->
					<a class="shop-link" href={shopHref}>
						{shop.shop_name}
						{#if shop.is_verified}
							<span class="verified"
								><Icon name="check-circle" size={16} />{t('product.verifiedShort')}</span
							>
						{/if}
					</a>
				{/if}
				<h1 class="t1">{product.name}</h1>
				{#if selected}
					<div class="prices">
						<span class="price">{amount(selected.price_cents)}</span>
						{#if selected.compare_price_cents && selected.compare_price_cents > selected.price_cents}
							<span class="was"
								><span class="sr">{t('product.was')} </span>{amount(
									selected.compare_price_cents
								)}</span
							>
						{/if}
					</div>
				{/if}
			</div>

			{#if variants.length === 0}
				<Alert tone="neutral" title={t('product.noVariants')}>
					{#if shop}
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- built with resolve() above -->
						<span><a href={shopHref}>{t('product.moreFrom', { shop: shop.shop_name })}</a></span>
					{/if}
				</Alert>
			{:else}
				<form method="POST" action="?/buy" class="vstack gap-24" use:enhance={s.submit}>
					{#if variants.length > 1}
						<fieldset class="field">
							<legend class="label">{t('product.option')}</legend>
							<div class="opts">
								{#each variants as v (v.id)}
									{@const out = (v.available_quantity ?? 0) === 0}
									<label class="ochip" class:is-off={out}>
										<input
											type="radio"
											name="variant_id"
											value={v.id}
											checked={selected?.id === v.id}
											disabled={out}
											onchange={() => (selectedId = v.id)}
										/>
										<span class="o-t">{v.title}</span>
										<span class="o-p">{out ? t('product.outOfStock') : amount(v.price_cents)}</span>
									</label>
								{/each}
							</div>
						</fieldset>
					{:else}
						<input type="hidden" name="variant_id" value={selected?.id} />
					{/if}

					{#if available > 0}
						<div class="field">
							<label class="label" for="quantity">{t('product.quantity')}</label>
							<div class="hstack gap-14">
								<Quantity id="quantity" max={Math.min(available, 100)} />
								{#if available <= 5}
									<span class="foot low">{t('product.left', { n: available })}</span>
								{/if}
							</div>
						</div>
						<div class="actions stack">
							<Submit busy={s.busy} class="btn-primary btn-block">{t('product.buyNow')}</Submit>
							<Submit busy={s.busy} class="btn-secondary btn-block" formaction="?/add"
								>{t('product.addToCart')}</Submit
							>
						</div>
					{:else}
						<p class="stock-out">{t('product.outOfStock')}</p>
					{/if}
				</form>
			{/if}

			<Trust title={t('product.protection')} text={t('product.protectionBody')}>
				<span class="foot faint pay-with">{t('product.payWith')}</span>
			</Trust>
		</div>
	</div>

	<div class="split">
		<section class="vstack gap-12" aria-labelledby="about-h">
			<h2 class="t3" id="about-h">{t('product.description')}</h2>
			{#if product.description}
				<p class="body muted pretty description">{product.description}</p>
			{:else}
				<p class="body faint">{t('product.noDescription')}</p>
			{/if}
		</section>

		{#if shop}
			<section class="card" aria-labelledby="seller-h">
				<div class="hstack gap-14 seller">
					<span class="avatar" aria-hidden="true">{shop.shop_name.slice(0, 1).toUpperCase()}</span>
					<div class="vstack">
						<span class="foot muted">{t('product.soldBy')}</span>
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- built with resolve() above -->
						<h2 class="t3" id="seller-h"><a class="ink" href={shopHref}>{shop.shop_name}</a></h2>
					</div>
				</div>
				<div class="hstack facts">
					{#if shop.is_verified}
						<span class="verified"
							><Icon name="check-circle" size={16} />{t('product.verified')}</span
						>
					{/if}
					{#if shop.city}
						<span class="foot muted hstack gap-4"><Icon name="pin" size={16} />{shop.city}</span>
					{/if}
				</div>
				<div class="mrows">
					<div class="mrow">
						<span>{t('product.delivery')}</span><span>{amount(shop.delivery_fee_cents)}</span>
					</div>
					{#if shop.free_delivery_threshold_cents != null}
						<div class="mrow">
							<span>{t('product.freeOverLabel')}</span><span
								>{amount(shop.free_delivery_threshold_cents)}</span
							>
						</div>
					{/if}
				</div>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- built with resolve() above -->
				<a class="btn btn-secondary btn-block" href={shopHref}>{t('seller.nav.viewShop')}</a>
			</section>
		{/if}
	</div>
</div>

<style>
	.shop-link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		align-self: flex-start;
		min-height: 32px;
		color: var(--ink-2);
		font-size: 14px;
		font-weight: 500;
	}
	.prices {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 4px 12px;
	}
	.field legend {
		margin-bottom: 8px;
	}
	.low {
		color: var(--warning-fg);
		font-weight: 600;
	}
	.pay-with {
		padding-top: 6px;
	}
	.description {
		white-space: pre-line;
	}
	.seller {
		flex-wrap: nowrap;
	}
	.seller .vstack {
		gap: 0;
	}
	.facts {
		gap: 6px 16px;
	}
	.ink {
		color: var(--ink);
	}
</style>
