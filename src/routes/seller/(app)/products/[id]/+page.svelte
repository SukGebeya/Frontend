<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Alert from '#lib/components/Alert.svelte';
	import CopyLink from '#lib/components/CopyLink.svelte';
	import Field from '#lib/components/Field.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import StatusBadge from '#lib/components/StatusBadge.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { lang, t } from '#lib/i18n/index.js';
	import { centsToInput, formatMoney } from '#lib/money.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const f = $derived(formState(form));
	const s = submitting();
	const add = submitting({ reset: true });

	const product = $derived(data.detail.product);
	const variants = $derived(data.detail.variants ?? []);
	const images = $derived(data.detail.images ?? []);
	const link = $derived(`${page.url.origin}/p/${product.slug}`);
	const amount = (cents: number) => formatMoney(cents, lang());
	const confirmDelete = (e: SubmitEvent) => {
		if (!confirm(t('products.deleteConfirm'))) e.preventDefault();
	};
</script>

<svelte:head><title>{product.name} · Gebeya</title></svelte:head>

<div class="spread">
	<h1>{product.name}</h1>
	<StatusBadge status={product.status} prefix="productStatus" />
</div>

<FormMessage form={f} />

<section class="card stack-sm" class:highlight={data.created}>
	{#if product.status === 'active'}
		<p class="label">{t('products.shareHint')}</p>
		<CopyLink url={link} />
	{:else}
		<p class="muted small">{t('products.notActive')}</p>
	{/if}
	{#if variants.length === 0}
		<Alert tone="warn">{t('products.variantsHint')}</Alert>
	{/if}
</section>

<section class="card stack" aria-labelledby="variants">
	<h2 id="variants">{t('products.variants')}</h2>
	{#if variants.length}
		<ul class="list">
			{#each variants as v (v.id)}
				<li class="stack-sm">
					<div class="spread">
						<span>
							<strong>{v.title}</strong>
							{#if !v.is_active}<span class="muted small">· {t('products.hidden')}</span>{/if}
							<br /><span class="muted small mono">{v.sku}</span>
						</span>
						<span class="end">
							<span class="amount">{amount(v.price_cents)}</span><br />
							<span class="muted small">{t('product.left', { n: v.available_quantity ?? 0 })}</span>
						</span>
					</div>
					<details>
						<summary class="small">{t('common.edit')}</summary>
						<div class="stack-sm edit">
							<form method="POST" action="?/updateVariant" class="row" use:enhance={s.submit}>
								<input type="hidden" name="variant_id" value={v.id} />
								<label class="sr-only" for="title-{v.id}">{t('products.variantTitle')}</label>
								<input id="title-{v.id}" name="title" defaultValue={v.title} class="grow" />
								<label class="sr-only" for="price-{v.id}">{t('products.price')}</label>
								<input
									id="price-{v.id}"
									name="price"
									inputmode="decimal"
									defaultValue={centsToInput(v.price_cents)}
									class="short"
								/>
								<button class="btn sm" disabled={s.busy}>{t('products.save')}</button>
							</form>
							<form method="POST" action="?/setStock" class="row" use:enhance={s.submit}>
								<input type="hidden" name="variant_id" value={v.id} />
								<label for="stock-{v.id}" class="small">{t('products.stock')}</label>
								<input
									id="stock-{v.id}"
									name="quantity"
									type="number"
									min="0"
									required
									class="short"
								/>
								<button class="btn sm" disabled={s.busy}>{t('products.setStock')}</button>
							</form>
							<div class="row">
								<form method="POST" action="?/updateVariant" use:enhance={s.submit}>
									<input type="hidden" name="variant_id" value={v.id} />
									<input type="hidden" name="price" value={centsToInput(v.price_cents)} />
									<input type="hidden" name="is_active" value={v.is_active ? 'false' : 'true'} />
									<button class="btn sm" disabled={s.busy}
										>{v.is_active ? t('products.hide') : t('products.show')}</button
									>
								</form>
								<form method="POST" action="?/deleteVariant" use:enhance={s.submit}>
									<input type="hidden" name="variant_id" value={v.id} />
									<button class="btn sm danger" disabled={s.busy}>{t('products.remove')}</button>
								</form>
							</div>
						</div>
					</details>
				</li>
			{/each}
		</ul>
	{/if}

	<details open={variants.length === 0}>
		<summary class="label">+ {t('products.addVariant')}</summary>
		<form method="POST" action="?/addVariant" class="stack edit" use:enhance={add.submit}>
			<Field
				id="new-title"
				label={t('products.variantTitle')}
				hint={t('products.variantTitleHint')}
			>
				<input id="new-title" name="title" required minlength="2" maxlength="200" />
			</Field>
			<div class="grid-2">
				<Field id="new-price" label={t('products.price')}>
					<input id="new-price" name="price" inputmode="decimal" required />
				</Field>
				<Field id="new-stock" label={t('products.stock')}>
					<input id="new-stock" name="stock" type="number" min="0" required value="1" />
				</Field>
			</div>
			<Field id="new-sku" label={t('products.sku')}>
				<input id="new-sku" name="sku" maxlength="100" placeholder="GB-…" />
			</Field>
			<button class="btn" disabled={add.busy}>{t('products.addVariant')}</button>
		</form>
	</details>
</section>

<section class="card stack" aria-labelledby="images">
	<h2 id="images">{t('products.images')}</h2>
	{#if images.length}
		<ul class="images">
			{#each images as image (image.id)}
				<li>
					<img src={image.url} alt={image.alt_text ?? ''} loading="lazy" />
					{#if image.is_primary}<span class="small muted">{t('products.primary')}</span>{/if}
					<form method="POST" action="?/deleteImage" use:enhance={s.submit}>
						<input type="hidden" name="image_id" value={image.id} />
						<button class="btn sm danger" disabled={s.busy}>{t('products.remove')}</button>
					</form>
				</li>
			{/each}
		</ul>
	{/if}
	<form method="POST" action="?/addImage" class="stack-sm" use:enhance={add.submit}>
		<Field
			id="image-url"
			label={t('products.imageUrl')}
			hint={t('products.imageHint')}
			error={f.fields?.url}
		>
			<input id="image-url" name="url" type="url" pattern="https://.*" required />
		</Field>
		<label class="row small"
			><input type="checkbox" name="is_primary" /> {t('products.primary')}</label
		>
		<button class="btn" disabled={add.busy}>{t('products.addImage')}</button>
	</form>
</section>

<form method="POST" action="?/update" class="card stack" use:enhance={s.submit}>
	<Field id="name" label={t('products.name')} error={f.fields?.name}>
		<input
			id="name"
			name="name"
			required
			minlength="2"
			maxlength="200"
			defaultValue={product.name}
		/>
	</Field>
	<Field id="description" label={t('products.description')} error={f.fields?.description}>
		<textarea
			id="description"
			name="description"
			maxlength="2000"
			defaultValue={product.description ?? ''}></textarea>
	</Field>
	<Field id="status" label={t('products.status')}>
		<select id="status" name="status" defaultValue={product.status}>
			{#each ['active', 'draft', 'archived'] as status (status)}
				<option value={status}>{t(`productStatus.${status}` as 'productStatus.active')}</option>
			{/each}
		</select>
	</Field>
	<button class="btn primary" disabled={s.busy}>{t('products.save')}</button>
</form>

<form method="POST" action="?/delete" onsubmit={confirmDelete}>
	<button class="btn danger sm">{t('products.delete')}</button>
</form>

<style>
	.highlight {
		border-color: var(--accent);
	}
	.end {
		text-align: right;
	}
	.edit {
		padding-top: 10px;
	}
	.grow {
		flex: 1;
		min-width: 8rem;
	}
	.short {
		width: 7rem;
	}
	summary {
		cursor: pointer;
		color: var(--accent);
	}
	.images {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 12px;
	}
	.images li {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.images img {
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: var(--radius-sm);
		background: var(--surface-2);
	}
</style>
