<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { formatDate, lang, t } from '#lib/i18n/index.js';
	import { formatMoney } from '#lib/money.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const f = $derived(formState(form));
	const s = submitting();
	const items = $derived(data.cart.items ?? []);
	const amount = (cents: number) => formatMoney(cents, lang());
</script>

<svelte:head><title>{t('cart.title')} · Gebeya</title></svelte:head>

<section class="stack">
	<h1>{t('cart.title')}</h1>
	<FormMessage form={f} />
	{#if items.length === 0}
		<p class="card muted">{t('cart.empty')}</p>
	{:else}
		<ul class="list card">
			{#each items as item (item.id)}
				<li class="stack-sm">
					<div class="spread">
						<div>
							<p class="name">{item.product_name}</p>
							<p class="muted small">{item.variant_title} · {amount(item.price_snapshot_cents)}</p>
						</div>
						<span class="amount">{amount(item.subtotal_cents)}</span>
					</div>
					<div class="row">
						<form method="POST" action="?/update" class="row" use:enhance={s.submit}>
							<input type="hidden" name="variant_id" value={item.variant_id} />
							<label class="sr-only" for="qty-{item.id}">{t('product.quantity')}</label>
							<input
								id="qty-{item.id}"
								name="quantity"
								type="number"
								min="1"
								max="100"
								defaultValue={item.quantity}
								class="qty"
							/>
							<button class="btn sm">{t('cart.update')}</button>
						</form>
						<form method="POST" action="?/remove" use:enhance={s.submit}>
							<input type="hidden" name="variant_id" value={item.variant_id} />
							<button class="btn sm danger">{t('cart.remove')}</button>
						</form>
					</div>
				</li>
			{/each}
		</ul>
		<div class="card stack-sm">
			<dl class="kv">
				<dt>{t('cart.subtotal')}</dt>
				<dd class="amount">{amount(data.cart.total_cents)}</dd>
			</dl>
			<p class="muted small">{t('checkout.deliveryAdded')}</p>
			{#if data.cart.expires_at}
				<p class="muted small">
					{t('cart.expires', { time: formatDate(data.cart.expires_at, true) })}
				</p>
			{/if}
			<a class="btn primary block" href={resolve('/checkout')}>{t('cart.checkout')}</a>
		</div>
	{/if}
</section>

<style>
	.name {
		font-weight: 600;
	}
	.qty {
		width: 5rem;
	}
</style>
