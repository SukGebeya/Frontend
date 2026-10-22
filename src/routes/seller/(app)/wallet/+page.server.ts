import { randomUUID } from 'node:crypto';
import type { Bank, Paginated, Payout, WalletTransaction } from '#lib/api/types.js';
import { translate } from '#lib/i18n/index.js';
import { money, text } from '#lib/server/forms.js';
import { failure, invalid, must } from '#lib/server/problem.js';
import type { Actions, PageServerLoad } from './$types';

const METHODS = ['telebirr', 'cbe_birr', 'bank_transfer'] as const;
type Method = (typeof METHODS)[number];

export const load: PageServerLoad = async ({ locals, url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const [wallet, transactions, payouts, banks] = await Promise.all([
		locals.api.GET('/merchant/wallet').then(must),
		locals.api
			.GET('/merchant/wallet/transactions', { params: { query: { page, per_page: 20 } } })
			.then(must),
		locals.api.GET('/merchant/wallet/payouts', { params: { query: { per_page: 10 } } }).then(must),
		// The bank list comes from Chapa; the page still works without it.
		locals.api.GET('/merchant/wallet/banks').then((r) => r.data ?? [])
	]);
	return {
		wallet,
		transactions: transactions as Paginated<WalletTransaction>,
		payouts: (payouts as Paginated<Payout>).items ?? [],
		banks: banks as Bank[],
		kycStatus: locals.user?.kyc_status ?? 'pending',
		idempotencyKey: randomUUID()
	};
};

export const actions: Actions = {
	payout: async ({ request, locals }) => {
		const form = await request.formData();
		const amount = money(form, 'amount');
		if (!amount) {
			const message = translate(locals.lang, 'common.invalidAmount');
			return invalid(message, form, { amount: message });
		}
		const method = text(form, 'method') as Method;
		const res = await locals.api.POST('/merchant/wallet/payout', {
			params: { header: { 'Idempotency-Key': text(form, 'idempotency_key') } },
			body: {
				amount_cents: amount,
				method: METHODS.includes(method) ? method : 'bank_transfer',
				bank_code: text(form, 'bank_code'),
				destination: text(form, 'destination'),
				account_name: text(form, 'account_name')
			}
		});
		if (!res.response.ok) return failure(res, form);
		return { notice: 'wallet.requested' as const };
	}
};
