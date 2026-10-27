<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import Field from '#lib/components/Field.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Submit from '#lib/components/Submit.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { lang, t } from '#lib/i18n/index.js';
	import { currency } from '#lib/money.js';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	const f = $derived(formState(form));
	const s = submitting();
	const v = (key: string, fallback = '') => f.values?.[key] ?? fallback;
</script>

<svelte:head><title>{t('products.new')} · {t('brand.name')}</title></svelte:head>

<div class="vstack gap-24 new">
	<div class="page-head">
		<a class="btn btn-link btn-sm back" href={resolve('/seller/(app)/products')}
			><Icon name="chevron-left" size={16} />{t('products.title')}</a
		>
		<h1 class="t1">{t('products.new')}</h1>
		<p class="body muted pretty">{t('products.newLead')}</p>
	</div>

	<FormMessage form={f} />

	<form method="POST" class="form" use:enhance={s.submit}>
		<Field id="name" label={t('products.name')} error={f.fields?.name}>
			<input
				class="input"
				id="name"
				name="name"
				required
				minlength="2"
				maxlength="200"
				defaultValue={v('name')}
			/>
		</Field>
		<Field
			id="description"
			label={t('products.description')}
			optional
			error={f.fields?.description}
		>
			<textarea
				class="input"
				id="description"
				name="description"
				maxlength="2000"
				placeholder={t('products.descriptionPlaceholder')}
				defaultValue={v('description')}></textarea>
		</Field>
		<div class="row2">
			<Field
				id="price"
				label={t('products.price')}
				suffix={currency(lang())}
				hint={t('products.priceHint')}
				error={f.fields?.price ?? f.fields?.price_cents}
			>
				<input
					class="input num"
					id="price"
					name="price"
					inputmode="decimal"
					required
					defaultValue={v('price')}
				/>
			</Field>
			<Field
				id="stock"
				label={t('products.stock')}
				error={f.fields?.stock ?? f.fields?.stock_quantity}
			>
				<input
					class="input num"
					id="stock"
					name="stock"
					type="number"
					inputmode="numeric"
					min="0"
					max="1000000"
					required
					defaultValue={v('stock', '1')}
				/>
			</Field>
		</div>
		<Field
			id="variant_title"
			label={t('products.variantTitle')}
			hint={t('products.firstOptionHint')}
			error={f.fields?.title}
		>
			<input
				class="input"
				id="variant_title"
				name="variant_title"
				maxlength="200"
				defaultValue={v('variant_title', 'Standard')}
			/>
		</Field>
		<Field
			id="image_url"
			label={t('products.imageUrl')}
			optional
			hint={t('products.imageHint')}
			error={f.fields?.url}
		>
			<input
				class="input"
				id="image_url"
				name="image_url"
				type="url"
				inputmode="url"
				pattern="https://.*"
				placeholder="https://"
				defaultValue={v('image_url')}
			/>
		</Field>
		<Submit busy={s.busy} class="btn-primary btn-block">{t('products.create')}</Submit>
		<p class="foot muted center">{t('products.goesLive')}</p>
	</form>
</div>

<style>
	.vstack.new {
		max-width: 600px;
	}
</style>
