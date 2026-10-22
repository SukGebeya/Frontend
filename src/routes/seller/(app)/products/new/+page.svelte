<script lang="ts">
	import { enhance } from '$app/forms';
	import Field from '#lib/components/Field.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { t } from '#lib/i18n/index.js';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	const f = $derived(formState(form));
	const s = submitting();
	const v = (key: string, fallback = '') => f.values?.[key] ?? fallback;
</script>

<svelte:head><title>{t('products.new')} · Gebeya</title></svelte:head>

<h1>{t('products.new')}</h1>
<FormMessage form={f} />

<form method="POST" class="card stack" use:enhance={s.submit}>
	<Field id="name" label={t('products.name')} error={f.fields?.name}>
		<input id="name" name="name" required minlength="2" maxlength="200" defaultValue={v('name')} />
	</Field>
	<Field id="description" label={t('products.description')} error={f.fields?.description}>
		<textarea id="description" name="description" maxlength="2000" defaultValue={v('description')}
		></textarea>
	</Field>
	<div class="grid-2">
		<Field id="price" label={t('products.price')} error={f.fields?.price ?? f.fields?.price_cents}>
			<input id="price" name="price" inputmode="decimal" required defaultValue={v('price')} />
		</Field>
		<Field
			id="stock"
			label={t('products.stock')}
			error={f.fields?.stock ?? f.fields?.stock_quantity}
		>
			<input
				id="stock"
				name="stock"
				type="number"
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
		hint={t('products.variantTitleHint')}
		error={f.fields?.title}
	>
		<input
			id="variant_title"
			name="variant_title"
			maxlength="200"
			placeholder="Standard"
			defaultValue={v('variant_title')}
		/>
	</Field>
	<Field
		id="image_url"
		label={t('products.imageUrl')}
		hint={t('products.imageHint')}
		error={f.fields?.url}
	>
		<input
			id="image_url"
			name="image_url"
			type="url"
			pattern="https://.*"
			defaultValue={v('image_url')}
		/>
	</Field>
	<button class="btn primary block" disabled={s.busy}>{t('products.create')}</button>
</form>
