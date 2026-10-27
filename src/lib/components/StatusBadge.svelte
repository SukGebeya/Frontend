<script lang="ts">
	import { tv } from '#lib/i18n/index.js';

	let { status, prefix = 'status' }: { status: string; prefix?: string } = $props();

	// Neutral statuses use the plain badge.
	const tones: Record<string, string> = {
		paid: 'b-info',
		processing: 'b-info',
		shipped: 'b-info',
		delivered: 'b-success',
		completed: 'b-success',
		active: 'b-success',
		disputed: 'b-warning',
		pending: 'b-warning',
		pending_payment: 'b-warning',
		failed: 'b-danger'
	};
</script>

<span class="badge {tones[status] ?? ''}">{tv(prefix, status)}</span>
