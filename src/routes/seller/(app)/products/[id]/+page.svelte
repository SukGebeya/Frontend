<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Alert from '#lib/components/Alert.svelte';
	import CopyLink from '#lib/components/CopyLink.svelte';
	import Field from '#lib/components/Field.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Img from '#lib/components/Img.svelte';
	import StatusBadge from '#lib/components/StatusBadge.svelte';
	import Submit from '#lib/components/Submit.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { lang, t } from '#lib/i18n/index.js';
	import { centsToInput, currency, formatMoney } from '#lib/money.js';
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
	const unit = $derived(currency(lang()));
	const imageName = (alt: string | undefined, i: number) =>
		alt || t('products.imageN', { n: i + 1 });
</script>

<svelte:head><title>{product.name} · {t('brand.name')}</title></svelte:head>

<div class="page-head">
	<a class="btn btn-link btn-sm back" href={resolve('/seller/(app)/products')}
		><Icon name="chevron-left" size={16} />{t('products.title')}</a
	>
	<div class="hstack between title">
		<h1 class="t1">{product.name}</h1>
		<StatusBadge status={product.status} prefix="productStatus" />
	</div>
</div>

<FormMessage form={f} />
{#if variants.length === 0}
	<Alert tone="warning" title={t('products.noOptionsTitle')}>
		<span>{t('products.variantsHint')}</span>
	</Alert>
{/if}

<section class="card" class:hi={data.created} aria-labelledby="share-h">
	<div class="vstack gap-4">
		<h2 class="card-t" id="share-h">
			{data.created ? t('products.liveTitle') : t('products.shareTitle')}
		</h2>
		<p class="foot muted">{t('products.shareLead')}</p>
	</div>
	{#if product.status !== 'active'}
		<p class="foot warn">{t('products.notActive')}</p>
	{/if}
	<CopyLink url={link} label={t('products.link')} />
</section>

<div class="split half">
	<div class="vstack gap-20">
		<section class="card" aria-labelledby="opt-h">
			<div class="card-h">
				<h2 class="card-t" id="opt-h">{t('products.variants')}</h2>
				<span class="foot muted"
					>{variants.length === 1
						? t('products.optionOne')
						: t('products.optionMany', { n: variants.length })}</span
				>
			</div>
			<div class="vstack gap-8">
				{#each variants as v (v.id)}
					{@const left = v.available_quantity ?? 0}
					<details class="disclose variant">
						<summary>
							<span class="vstack gap-2 sum">
								<span class="hstack"
									><span class="callout strong">{v.title}</span><span
										class="badge"
										class:b-success={v.is_active}
										>{v.is_active ? t('productStatus.active') : t('products.hidden')}</span
									></span
								>
								<span class="foot muted num"
									>{v.sku} · {amount(v.price_cents)} · {left > 0
										? t('product.left', { n: left })
										: t('product.outOfStock')}</span
								>
							</span>
							<Icon name="chevron-down" size={18} class="chev-d" />
						</summary>
						<div class="disclose-b">
							<form method="POST" action="?/updateVariant" class="form" use:enhance={s.submit}>
								<input type="hidden" name="variant_id" value={v.id} />
								<div class="row2 stack-sm">
									<Field id="title-{v.id}" label={t('products.variantTitle')}>
										<input
											class="input"
											id="title-{v.id}"
											name="title"
											maxlength="200"
											defaultValue={v.title}
										/>
									</Field>
									<Field id="price-{v.id}" label={t('products.price')} suffix={unit}>
										<input
											class="input num"
											id="price-{v.id}"
											name="price"
											inputmode="decimal"
											required
											defaultValue={centsToInput(v.price_cents)}
										/>
									</Field>
								</div>
								<Submit busy={s.busy} class="btn-primary btn-sm self-start"
									>{t('products.save')}</Submit
								>
							</form>
							<div class="divider"></div>
							<form method="POST" action="?/setStock" class="stock" use:enhance={s.submit}>
								<input type="hidden" name="variant_id" value={v.id} />
								<Field id="stock-{v.id}" label={t('products.stock')}>
									<input
										class="input num"
										id="stock-{v.id}"
										name="quantity"
										type="number"
										inputmode="numeric"
										min="0"
										required
										placeholder={String(left)}
									/>
								</Field>
								<Submit busy={s.busy} class="btn-secondary btn-sm">{t('products.setStock')}</Submit>
							</form>
							<div class="divider"></div>
							<form method="POST" action="?/updateVariant" class="hstack" use:enhance={s.submit}>
								<input type="hidden" name="variant_id" value={v.id} />
								<input type="hidden" name="price" value={centsToInput(v.price_cents)} />
								<input type="hidden" name="is_active" value={v.is_active ? 'false' : 'true'} />
								<Submit busy={s.busy} class="btn-secondary btn-sm"
									>{v.is_active ? t('products.hide') : t('products.show')}</Submit
								>
								<Submit
									busy={s.busy}
									class="btn-danger btn-sm push"
									formaction="?/deleteVariant"
									aria-label={t('products.removeOption', { name: v.title })}
									>{t('products.remove')}</Submit
								>
							</form>
						</div>
					</details>
				{/each}

				<details class="disclose add" open={variants.length === 0}>
					<summary>
						<span class="summary-l"><Icon name="plus" size={18} />{t('products.addVariant')}</span>
						<Icon name="chevron-down" size={18} class="chev-d" />
					</summary>
					<form method="POST" action="?/addVariant" class="disclose-b" use:enhance={add.submit}>
						<div class="row2 stack-sm">
							<Field
								id="new-title"
								label={t('products.variantTitle')}
								hint={t('products.variantTitleHint')}
							>
								<input
									class="input"
									id="new-title"
									name="title"
									required
									minlength="2"
									maxlength="200"
								/>
							</Field>
							<Field id="new-price" label={t('products.price')} suffix={unit}>
								<input class="input num" id="new-price" name="price" inputmode="decimal" required />
							</Field>
						</div>
						<div class="row2">
							<Field id="new-stock" label={t('products.stock')}>
								<input
									class="input num"
									id="new-stock"
									name="stock"
									type="number"
									inputmode="numeric"
									min="0"
									required
									value="1"
								/>
							</Field>
							<Field id="new-sku" label={t('products.sku')} optional>
								<input
									class="input"
									id="new-sku"
									name="sku"
									maxlength="100"
									placeholder={t('products.skuAuto')}
								/>
							</Field>
						</div>
						<Submit busy={add.busy} class="btn-primary btn-block">{t('products.addVariant')}</Submit
						>
					</form>
				</details>
			</div>
		</section>

		<section class="card" aria-labelledby="det-h">
			<h2 class="card-t" id="det-h">{t('products.details')}</h2>
			<form method="POST" action="?/update" class="form" use:enhance={s.submit}>
				<Field id="name" label={t('products.name')} error={f.fields?.name}>
					<input
						class="input"
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
						class="input"
						id="description"
						name="description"
						maxlength="2000"
						defaultValue={product.description ?? ''}></textarea>
				</Field>
				<Field id="status" label={t('products.status')} hint={t('products.statusHint')}>
					<span class="select">
						<select class="input" id="status" name="status" defaultValue={product.status}>
							{#each ['active', 'draft', 'archived'] as status (status)}
								<option value={status}
									>{t(`productStatus.${status}` as 'productStatus.active')}</option
								>
							{/each}
						</select>
						<Icon name="chevron-down" size={18} />
					</span>
				</Field>
				<Submit busy={s.busy} class="btn-primary btn-fluid">{t('products.save')}</Submit>
			</form>
		</section>
	</div>

	<div class="vstack gap-20">
		<section class="card" aria-labelledby="img-h">
			<div class="card-h">
				<h2 class="card-t" id="img-h">{t('products.images')}</h2>
				<span class="foot muted">{t('products.mainFirst')}</span>
			</div>
			{#if images.length}
				<div class="list images">
					{#each images as image, i (image.id)}
						<form method="POST" action="?/deleteImage" class="lrow" use:enhance={s.submit}>
							<input type="hidden" name="image_id" value={image.id} />
							<span class="thumb-s pic"><Img src={image.url} /></span>
							<span class="lrow-main">
								<span class="lrow-t">{imageName(image.alt_text, i)}</span>
								{#if image.is_primary}<span class="lrow-s primary">{t('products.primary')}</span
									>{/if}
							</span>
							<Submit
								busy={s.busy}
								class="btn-link btn-sm danger-link"
								aria-label={t('products.removeImage', { name: imageName(image.alt_text, i) })}
								>{t('products.remove')}</Submit
							>
						</form>
					{/each}
				</div>
			{/if}
			<form method="POST" action="?/addImage" class="form add-image" use:enhance={add.submit}>
				<Field
					id="image-url"
					label={t('products.imageUrl')}
					hint={t('products.imageHintShort')}
					error={f.fields?.url}
				>
					<input
						class="input"
						id="image-url"
						name="url"
						type="url"
						inputmode="url"
						pattern="https://.*"
						placeholder="https://"
						required
					/>
				</Field>
				<label class="check"
					><input type="checkbox" name="is_primary" /><span>{t('products.primary')}</span></label
				>
				<Submit busy={add.busy} class="btn-secondary btn-block">{t('products.addImage')}</Submit>
			</form>
		</section>

		<details class="disclose danger">
			<summary>
				<span class="summary-l"><Icon name="trash" size={18} />{t('products.delete')}</span>
				<Icon name="chevron-down" class="chev-d" />
			</summary>
			<form method="POST" action="?/delete" class="disclose-b" use:enhance={s.submit}>
				<p class="sub muted pretty">{t('products.deleteLead', { name: product.name })}</p>
				<Submit busy={s.busy} class="btn-danger btn-block">{t('products.delete')}</Submit>
			</form>
		</details>
	</div>
</div>

<style>
	.hstack.title {
		gap: 12px;
	}
	.split.half {
		gap: 20px;
	}
	.warn {
		color: var(--warning-fg);
		font-weight: 600;
	}
	.disclose.variant {
		background: var(--surface);
		border-radius: 16px;
	}
	.disclose.variant > summary {
		align-items: center;
		min-height: 68px;
		padding: 12px 16px;
		font-weight: 400;
	}
	.sum {
		flex: 1;
	}
	.disclose.variant > .disclose-b {
		gap: 16px;
		padding: 0 16px 16px;
	}
	.stock {
		display: flex;
		align-items: flex-end;
		gap: 8px;
	}
	.stock :global(.field) {
		flex: 1;
	}
	.stock :global(.btn) {
		min-height: 48px;
	}
	.variant :global(.push) {
		margin-left: auto;
	}
	.list.images {
		background: var(--surface);
	}
	.images .lrow {
		padding: 12px;
	}
	.thumb-s.pic {
		width: 56px;
		height: 56px;
	}
	.primary {
		color: var(--accent);
		font-weight: 600;
	}
	.images :global(.danger-link) {
		padding: 0 8px;
		color: var(--danger-fg);
	}
	.form.add-image {
		gap: 12px;
	}
	.add-image .check {
		padding: 4px 0;
	}
</style>
