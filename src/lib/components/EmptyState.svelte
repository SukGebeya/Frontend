<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon, { type IconName } from './Icon.svelte';

	let {
		icon,
		title,
		text,
		level = 2,
		children
	}: { icon: IconName; title: string; text?: string; level?: 2 | 3; children?: Snippet } = $props();
</script>

<div class="empty">
	<span class="empty-i"><Icon name={icon} size={26} /></span>
	<svelte:element this={`h${level}`} class="t3">{title}</svelte:element>
	{#if text}<p class="sub muted pretty">{text}</p>{/if}
	{@render children?.()}
</div>
