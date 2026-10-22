<script lang="ts">
	import { tv } from '#lib/i18n/index.js';

	let { status, prefix = 'status' }: { status: string; prefix?: string } = $props();

	const tones: Record<string, string> = {
		pending_payment: 'neutral',
		paid: 'info',
		processing: 'info',
		shipped: 'info',
		delivered: 'good',
		completed: 'good',
		active: 'good',
		disputed: 'warn',
		pending: 'warn',
		draft: 'neutral',
		archived: 'neutral',
		cancelled: 'neutral',
		refunded: 'neutral',
		failed: 'bad'
	};
</script>

<span class="badge {tones[status] ?? 'neutral'}">{tv(prefix, status)}</span>

<style>
	.badge {
		display: inline-block;
		padding: 2px 10px;
		border-radius: 999px;
		font-size: 0.8rem;
		font-weight: 600;
		white-space: nowrap;
	}
	.neutral {
		background: var(--surface-2);
		color: var(--muted);
	}
	.info {
		background: var(--info-soft);
		color: var(--info-ink);
	}
	.good {
		background: var(--accent-soft);
		color: var(--success-ink);
	}
	.warn {
		background: var(--warn-soft);
		color: var(--warn-ink);
	}
	.bad {
		background: var(--danger-soft);
		color: var(--danger);
	}
</style>
