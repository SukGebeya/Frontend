<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon, { type IconName } from './Icon.svelte';

	type Tone = 'info' | 'success' | 'warning' | 'error' | 'neutral';

	let {
		tone = 'info',
		title,
		icon,
		children
	}: { tone?: Tone; title?: string; icon?: IconName; children?: Snippet } = $props();

	const icons: Record<Tone, IconName> = {
		info: 'info',
		success: 'check-circle',
		warning: 'warning',
		error: 'x-circle',
		neutral: 'info'
	};
	const roles: Partial<Record<Tone, string>> = { error: 'alert', success: 'status' };
</script>

<div class="alert alert-{tone}" role={roles[tone]}>
	<Icon name={icon ?? icons[tone]} />
	<div class="alert-b">
		{#if title}<strong>{title}</strong>{/if}
		{@render children?.()}
	</div>
</div>
