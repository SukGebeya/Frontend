<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Quantity from '#lib/components/Quantity.svelte';
	import Submit from '#lib/components/Submit.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { formatDate, lang, t, tSplit } from '#lib/i18n/index.js';
	import { formatMoney } from '#lib/money.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const f = $derived(formState(form));
	const s = submitting();
	const items = $derived(data.cart.items ?? []);
	const amount = (cents: number) => formatMoney(cents, lang());
	const held = $derived(tSplit('cart.expires', 'time'));
</script>

<svelte:head><title>{t('cart.title')} · {t('brand.name')}</title></svelte:head>

<div class="vstack gap-24">
	<h1 class="t1">{t('cart.title')}</h1>
	<FormMessage form={f} />

	{#if items.length === 0}
		<EmptyState icon="bag" title={t('cart.empty')} text={t('cart.emptyLead')}>
			<a class="btn btn-secondary btn-sm" href={resolve('/orders')}>{t('home.myOrders')}</a>
		</EmptyState>
	{:else}
		<div class="split aside">
			<section class="list" aria-label={t('order.items')}>
				{#each items as item (item.id)}
					<form method="POST" action="?/update" class="lrow line" use:enhance={s.submit}>
						<input type="hidden" name="variant_id" value={item.variant_id} />
						<div class="hstack top">
							<span class="ph pic" aria-hidden="true"><Icon name="image" size={22} /></span>
							<div class="lrow-main">
								<span class="callout strong">{item.product_name}</span>
								<span class="foot muted">{item.variant_title}</span>
								<span class="foot muted num"
									>{t('cart.each', { price: amount(item.price_snapshot_cents) })}</span
								>
							</div>
							<span class="callout strong num nowrap">{amount(item.subtotal_cents)}</span>
						</div>
						<div class="hstack">
							<Quantity
								id="qty-{item.id}"
								value={item.quantity}
								max={100}
								small
								label={t('cart.quantityFor', {
									name: item.product_name,
									option: item.variant_title
								})}
							/>
							<Submit busy={s.busy} class="btn-secondary btn-sm">{t('cart.update')}</Submit>
							<Submit busy={s.busy} class="btn-link btn-sm remove" formaction="?/remove"
								>{t('cart.remove')}</Submit
							>
						</div>
					</form>
				{/each}
			</section>

			<aside class="card" aria-labelledby="sum-h">
				<h2 class="card-t" id="sum-h">{t('cart.summary')}</h2>
				<div class="mrows">
					<div class="mrow">
						<span>{t('cart.subtotal')}</span><span>{amount(data.cart.total_cents)}</span>
					</div>
					<div class="mrow">
						<span>{t('order.delivery')}</span><span>{t('cart.deliveryLater')}</span>
					</div>
				</div>
				<p class="foot muted">{t('checkout.deliveryAdded')}</p>
				<div class="divider"></div>
				{#if data.cart.expires_at}
					<p class="foot muted note">
						<Icon name="clock" size={16} />
						<span
							>{held[0]}<span class="num strong ink">{formatDate(data.cart.expires_at, true)}</span
							>{held[1]}</span
						>
					</p>
				{/if}
				<a class="btn btn-primary btn-block" href={resolve('/checkout')}>{t('cart.checkout')}</a>
				<p class="foot muted note shield">
					<Icon name="shield" size={16} /><span>{t('cart.protected')}</span>
				</p>
			</aside>
		</div>
	{/if}
</div>

<style>
	.lrow.line {
		flex-direction: column;
		align-items: stretch;
		gap: 14px;
		padding: 16px;
	}
	.hstack.top {
		align-items: flex-start;
		flex-wrap: nowrap;
		gap: 14px;
	}
	.ph.pic {
		flex: none;
		width: 64px;
		height: 64px;
		border-radius: 14px;
		background: var(--bg-3);
	}
	.nowrap {
		white-space: nowrap;
	}
	.line :global(.remove) {
		margin-left: auto;
		color: var(--ink-2);
	}
	.ink {
		color: var(--ink);
	}
	.shield :global(svg) {
		color: var(--accent);
	}
</style>
