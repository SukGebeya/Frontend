<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import Alert from '#lib/components/Alert.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import Field from '#lib/components/Field.svelte';
	import FormMessage from '#lib/components/FormMessage.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Pagination from '#lib/components/Pagination.svelte';
	import StatusBadge from '#lib/components/StatusBadge.svelte';
	import Submit from '#lib/components/Submit.svelte';
	import { formState, submitting } from '#lib/forms.svelte.js';
	import { formatDate, lang, t, tv } from '#lib/i18n/index.js';
	import { currency, formatAmount, formatMoney } from '#lib/money.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const f = $derived(formState(form));
	// Clear the form after a request so a second payout is never one tap away.
	const s = submitting({ reset: true });
	const amount = (cents: number) => formatMoney(cents, lang());

	const canWithdraw = $derived(data.profile.is_verified && data.kycStatus === 'verified');
	const methods = ['telebirr', 'cbe_birr', 'bank_transfer'] as const;
	let method = $state<string>('telebirr');
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
	const transactions = $derived(data.transactions.items ?? []);
</script>

<svelte:head><title>{t('wallet.title')} · {t('brand.name')}</title></svelte:head>

{#snippet money(cents: number)}{formatAmount(cents)}<small> {currency(lang())}</small>{/snippet}

<h1 class="t1">{t('wallet.title')}</h1>
<FormMessage form={f} />

<div class="stats three">
	<div class="stat hi span-sm">
		<span class="stat-l">{t('seller.available')}</span>
		<span class="stat-v">{@render money(data.wallet.available_cents)}</span>
		<span class="stat-s">{t('wallet.availableNote')}</span>
	</div>
	<div class="stat">
		<span class="stat-l">{t('seller.held')}</span>
		<span class="stat-v">{@render money(data.wallet.pending_payout_cents)}</span>
		<span class="stat-s">{t('wallet.heldNote')}</span>
	</div>
	<div class="stat">
		<span class="stat-l">{t('seller.balance')}</span>
		<span class="stat-v">{@render money(data.wallet.balance_cents)}</span>
	</div>
</div>

<div class="split half">
	<section class="card" aria-labelledby="po-h">
		<div class="vstack gap-4">
			<h2 class="card-t" id="po-h">{t('wallet.submit')}</h2>
			<p class="foot muted">{t('wallet.reviewNote')}</p>
		</div>

		{#if !canWithdraw}
			<Alert tone="info" title={t('wallet.lockedTitle')}>
				<span
					>{t('wallet.lockedLead')}
					<a href={resolve('/seller/(app)')}>{t('wallet.seeStatus')}</a></span
				>
			</Alert>
		{:else}
			<form method="POST" action="?/payout" class="form payout" use:enhance={s.submit}>
				<input type="hidden" name="idempotency_key" value={data.idempotencyKey} />
				<Field
					id="amount"
					label={t('wallet.amount')}
					suffix={currency(lang())}
					hint={t('wallet.amountHint', {
						min: amount(100),
						max: amount(data.wallet.available_cents)
					})}
					error={f.fields?.amount ?? f.fields?.amount_cents}
				>
					<input
						class="input num"
						id="amount"
						name="amount"
						inputmode="decimal"
						required
						defaultValue={f.values?.amount ?? ''}
					/>
				</Field>
				<fieldset class="field">
					<legend class="label">{t('wallet.method')}</legend>
					<div class="rcards">
						{#each methods as m (m)}
							<label class="rcard">
								<input type="radio" name="method" value={m} bind:group={method} />
								<span class="rcard-b"><span class="callout strong">{tv('method', m)}</span></span>
							</label>
						{/each}
					</div>
					{#if f.fields?.method}<p class="err">{f.fields.method}</p>{/if}
				</fieldset>
				<Field
					id="bank_code"
					label={t('wallet.bank')}
					hint={t('wallet.bankHint')}
					error={f.fields?.bank_code}
				>
					<span class="select">
						<select
							class="input"
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
						<Icon name="chevron-down" size={18} />
					</span>
				</Field>
				<Field id="destination" label={t('wallet.destination')} error={f.fields?.destination}>
					<input
						class="input num"
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
						class="input"
						id="account_name"
						name="account_name"
						autocomplete="name"
						required
						minlength="2"
						maxlength="100"
						defaultValue={f.values?.account_name ?? ''}
					/>
				</Field>
				<Submit
					busy={s.busy}
					class="btn-primary btn-block"
					disabled={data.wallet.available_cents < 100}>{t('wallet.submit')}</Submit
				>
			</form>
		{/if}
	</section>

	<section class="card payouts" aria-labelledby="pl-h">
		<div class="card-h">
			<h2 class="card-t" id="pl-h">{t('wallet.payouts')}</h2>
			{#if data.payouts.length}<span class="foot muted">{t('wallet.last10')}</span>{/if}
		</div>
		{#each data.payouts as p (p.id)}
			<div class="payout-row">
				<div class="hstack between">
					<span class="lrow-t num">{amount(p.amount_cents)}</span>
					<StatusBadge status={p.status} prefix="payoutStatus" />
				</div>
				<span class="lrow-s num">{tv('method', p.method)} · {p.destination}</span>
				<span class="lrow-s num"
					>{t('wallet.requestedOn', { date: formatDate(p.requested_at, true) })}</span
				>
				{#if p.failure_reason}<span class="foot why">{p.failure_reason}</span>{/if}
			</div>
		{:else}
			<p class="sub muted payout-row">{t('wallet.noPayouts')}</p>
		{/each}
	</section>
</div>

<section class="vstack gap-14" aria-labelledby="tx-h">
	<h2 class="t3" id="tx-h">{t('wallet.transactions')}</h2>
	{#if transactions.length === 0}
		<EmptyState
			icon="wallet"
			level={3}
			title={t('wallet.noTransactions')}
			text={t('wallet.noTransactionsLead')}
		/>
	{:else}
		<div class="list">
			{#each transactions as tx (tx.id)}
				<div class="lrow">
					<span class="thumb-s dir"
						><Icon name={debit(tx.type) ? 'arrow-out' : 'arrow-in'} size={18} /></span
					>
					<div class="lrow-main">
						<span class="lrow-t">{tv('txn', tx.type)}</span>
						<span class="lrow-s num"
							>{#if tx.order_id}<a href={resolve('/seller/(app)/orders/[id]', { id: tx.order_id })}
									>{t('order.title', { id: `#${tx.order_id.slice(0, 8)}` })}</a
								>&nbsp;·&nbsp;{/if}{formatDate(tx.created_at, true)}</span
						>
					</div>
					<span class="lrow-amt" class:debit={debit(tx.type)}
						>{debit(tx.type) ? '−' : '+'}{amount(tx.amount_cents)}</span
					>
				</div>
			{/each}
		</div>
		<Pagination page={data.transactions.page} pages={data.transactions.total_pages} />
	{/if}
</section>

<style>
	.split.half {
		gap: 16px;
	}
	.form.payout {
		gap: 18px;
	}
	.field .rcards {
		gap: 8px;
	}
	.rcards .rcard {
		align-items: center;
	}
	legend {
		margin-bottom: 8px;
	}
	.card.payouts {
		gap: 8px;
	}
	.payouts .card-h {
		padding-bottom: 8px;
	}
	.payout-row {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 12px 0;
		border-top: 1px solid var(--line);
	}
	.payout-row .hstack {
		gap: 12px;
		min-height: 28px;
	}
	.why {
		padding-top: 2px;
		color: var(--danger-fg);
	}
	.thumb-s.dir {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--bg);
	}
	.debit {
		color: var(--ink-2);
	}
</style>
