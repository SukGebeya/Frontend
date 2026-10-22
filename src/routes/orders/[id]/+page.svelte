<script lang="ts">
	import { enhance } from '$app/forms';
	import Alert from '#lib/components/Alert.svelte';
	import Field from '#lib/components/Field.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import OrderProgress from '#lib/components/OrderProgress.svelte';
	import OrderSummary from '#lib/components/OrderSummary.svelte';
	import StatusBadge from '#lib/components/StatusBadge.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { formatDate, t } from '#lib/i18n/index.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const f = $derived(formState(form));
	const s = submitting();
	const order = $derived(data.detail.order);
	let disputing = $state(false);
	const canDispute = $derived(order.status === 'shipped' || order.status === 'processing');
</script>

<svelte:head><title>{t('order.title', { id: order.id.slice(0, 8) })} · Gebeya</title></svelte:head>

<section class="stack">
	<header class="spread">
		<div>
			<h1 class="mono">{t('order.title', { id: `#${order.id.slice(0, 8)}` })}</h1>
			<p class="muted small">{t('order.placed', { date: formatDate(order.created_at, true) })}</p>
		</div>
		<StatusBadge status={order.status} />
	</header>

	<OrderProgress status={order.status} />
	<FormMessage form={f} />

	{#if order.status === 'disputed'}
		<Alert tone="warn">
			<p>{t('order.disputeOpen', { reason: order.dispute_reason ?? '' })}</p>
			<p class="small">{t('order.disputeLead')}</p>
		</Alert>
	{/if}

	{#if order.status === 'shipped'}
		<section class="card stack">
			<p>{t('order.confirmLead')}</p>
			<form method="POST" action="?/confirm" use:enhance={s.submit}>
				<button class="btn primary block" disabled={s.busy}>{t('order.confirm')}</button>
			</form>
			<p class="muted small">{t('order.autoConfirm')}</p>
		</section>
	{/if}

	{#if order.status === 'pending_payment'}
		<form method="POST" action="?/refresh" use:enhance={s.submit}>
			<button class="btn block" disabled={s.busy}>{t('order.checkPayment')}</button>
		</form>
	{/if}

	<OrderSummary detail={data.detail} />

	{#if canDispute}
		{#if disputing || f.fields?.reason}
			<form method="POST" action="?/dispute" class="card stack" use:enhance={s.submit}>
				<p class="muted small">{t('order.disputeLead')}</p>
				<Field id="reason" label={t('order.disputeReason')} error={f.fields?.reason}>
					<textarea
						id="reason"
						name="reason"
						required
						minlength="5"
						maxlength="1000"
						defaultValue={f.values?.reason ?? ''}></textarea>
				</Field>
				<div class="row">
					<button class="btn danger" disabled={s.busy}>{t('order.disputeSubmit')}</button>
					<button type="button" class="btn" onclick={() => (disputing = false)}
						>{t('common.cancel')}</button
					>
				</div>
			</form>
		{:else}
			<button class="btn link" onclick={() => (disputing = true)}>{t('order.dispute')}</button>
		{/if}
	{/if}

	{#if order.status === 'pending_payment' || order.status === 'paid'}
		<form method="POST" action="?/cancel" use:enhance={s.submit}>
			<button class="btn danger sm" disabled={s.busy}>{t('order.cancel')}</button>
		</form>
	{/if}
</section>
