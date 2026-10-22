<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		tone = 'info',
		children
	}: { tone?: 'info' | 'success' | 'warn' | 'error'; children: Snippet } = $props();
</script>

<div class="alert {tone}" role={tone === 'error' ? 'alert' : 'status'}>
	{@render children()}
</div>

<style>
	.alert {
		border-radius: var(--radius-sm);
		padding: 12px 14px;
		font-size: 0.95rem;
	}
	.info {
		background: var(--info-soft);
		color: var(--info-ink);
	}
	.success {
		background: var(--accent-soft);
		color: var(--success-ink);
	}
	.warn {
		background: var(--warn-soft);
		color: var(--warn-ink);
	}
	.error {
		background: var(--danger-soft);
		color: var(--danger);
	}
</style>
