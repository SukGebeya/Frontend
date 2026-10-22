<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import Alert from '#lib/components/Alert.svelte';
	import Field from '#lib/components/Field.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import Pagination from '#lib/components/Pagination.svelte';
	import StatusBadge from '#lib/components/StatusBadge.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { formatDate, lang, t, tv } from '#lib/i18n/index.js';
	import { formatMoney } from '#lib/money.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const f = $derived(formState(form));
	// Clear the form after a request so a second payout is never one tap away.
	const s = submitting({ reset: true });
	const amount = (cents: number) => formatMoney(cents, lang());

	const canWithdraw = $derived(data.profile.is_verified && data.kycStatus === 'verified');
	let method = $state('telebirr');
	let bankCode = $state('');
	// Preselect the matching wallet when switching to Telebirr or CBE Birr.
	const suggested = $derived.by(() => {
		const match = (re: RegExp) => data.banks.find((b) => re.test(`${b.slug} ${b.name}`))?.id ?? '';
		if (method === 'telebirr') return match(/tele/i);
		if (method === 'cbe_birr') return match(/cbe\s*birr|cbebirr/i);
		return '';
	});
	const bank = $derived(bankCode || suggested);
	const debit = (type: string) => type.endsWith('_debit');
</script>

<svelte:head><title>{t('wallet.title')} · Gebeya</title></svelte:head>

<h1>{t('wallet.title')}</h1>

<section class="stats">
	<div class="card stat">
		<span class="muted small">{t('seller.available')}</span>
		<span class="big amount">{amount(data.wallet.available_cents)}</span>
	</div>
	<div class="card stat">
		<span class="muted small">{t('seller.held')}</span>
		<span class="big amount">{amount(data.wallet.pending_payout_cents)}</span>
	</div>
</section>

<FormMessage form={f} />

<section class="card stack" aria-labelledby="withdraw">
	<h2 id="withdraw">{t('wallet.request')}</h2>
	{#if !canWithdraw}
		<Alert tone="info">{t('wallet.kycNote')}</Alert>
	{:else}
		<form method="POST" action="?/payout" class="stack" use:enhance={s.submit}>
			<input type="hidden" name="idempotency_key" value={data.idempotencyKey} />
			<div class="grid-2">
				<Field
					id="amount"
					label={t('wallet.amount')}
					hint={t('wallet.minimum')}
					error={f.fields?.amount ?? f.fields?.amount_cents}
				>
					<input
						id="amount"
						name="amount"
						inputmode="decimal"
						required
						defaultValue={f.values?.amount ?? ''}
					/>
				</Field>
				<Field id="method" label={t('wallet.method')} error={f.fields?.method}>
					<select id="method" name="method" bind:value={method}>
						{#each ['telebirr', 'cbe_birr', 'bank_transfer'] as m (m)}
							<option value={m}>{tv('method', m)}</option>
						{/each}
					</select>
				</Field>
			</div>
			<Field id="bank_code" label={t('wallet.bank')} error={f.fields?.bank_code}>
				<select
					id="bank_code"
					name="bank_code"
					required
					value={bank}
					onchange={(e) => (bankCode = e.currentTarget.value)}
				>
					<option value="" disabled>—</option>
					{#each data.banks as b (b.id)}
						<option value={b.id}>{b.name}</option>
					{/each}
				</select>
			</Field>
			<div class="grid-2">
				<Field id="destination" label={t('wallet.destination')} error={f.fields?.destination}>
					<input
						id="destination"
						name="destination"
						inputmode={method === 'bank_transfer' ? 'numeric' : 'tel'}
						required
						minlength="5"
						maxlength="50"
						defaultValue={f.values?.destination ?? ''}
					/>
				</Field>
				<Field id="account_name" label={t('wallet.accountName')} error={f.fields?.account_name}>
					<input
						id="account_name"
						name="account_name"
						required
						minlength="2"
						maxlength="100"
						defaultValue={f.values?.account_name ?? ''}
					/>
				</Field>
			</div>
			<button class="btn primary block" disabled={s.busy || data.wallet.available_cents < 100}
				>{t('wallet.submit')}</button
			>
		</form>
	{/if}
</section>

<section class="card stack-sm" aria-labelledby="payouts">
	<h2 id="payouts">{t('wallet.payouts')}</h2>
	{#if data.payouts.length === 0}
		<p class="muted">{t('wallet.noPayouts')}</p>
	{:else}
		<ul class="list">
			{#each data.payouts as p (p.id)}
				<li class="spread">
					<span class="stack-sm">
						<span>{tv('method', p.method)} · <span class="mono">{p.destination}</span></span>
						<span class="muted small">{formatDate(p.requested_at, true)}</span>
						{#if p.failure_reason}<span class="error-text">{p.failure_reason}</span>{/if}
					</span>
					<span class="stack-sm end">
						<span class="amount">{amount(p.amount_cents)}</span>
						<StatusBadge status={p.status} prefix="payoutStatus" />
					</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<section class="card stack-sm" aria-labelledby="transactions">
	<h2 id="transactions">{t('wallet.transactions')}</h2>
	{#if (data.transactions.items ?? []).length === 0}
		<p class="muted">{t('wallet.noTransactions')}</p>
	{:else}
		<ul class="list">
			{#each data.transactions.items as tx (tx.id)}
				<li class="spread">
					<span class="stack-sm">
						<span>{tv('txn', tx.type)}</span>
						<span class="muted small">
							{formatDate(tx.created_at, true)}
							{#if tx.order_id}· <a
									href={resolve('/seller/(app)/orders/[id]', { id: tx.order_id })}
									class="mono">#{tx.order_id.slice(0, 8)}</a
								>{/if}
						</span>
					</span>
					<span class="amount" class:debit={debit(tx.type)}>
						{debit(tx.type) ? '−' : '+'}{amount(tx.amount_cents)}
					</span>
				</li>
			{/each}
		</ul>
		<Pagination page={data.transactions.page} pages={data.transactions.total_pages} />
	{/if}
</section>

<style>
	.stats {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}
	.stat {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.big {
		font-size: 1.3rem;
	}
	.end {
		align-items: flex-end;
	}
	.debit {
		color: var(--muted);
	}
</style>
