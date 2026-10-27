<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	let {
		title,
		text,
		small = false,
		children
	}: { title: string; text: string; small?: boolean; children?: Snippet } = $props();
</script>

<div class="trust" class:sm={small}>
	<span class="trust-i"><Icon name="shield" size={small ? 18 : 20} /></span>
	<span class="trust-b">
		<span class="trust-t">{title}</span>
		<span class="trust-p">{text}</span>
		{@render children?.()}
	</span>
</div>
