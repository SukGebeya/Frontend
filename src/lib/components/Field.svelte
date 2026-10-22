<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		id,
		label,
		error,
		hint,
		children
	}: { id: string; label: string; error?: string; hint?: string; children: Snippet } = $props();
</script>

<div class="field" class:invalid={!!error}>
	<label for={id}>{label}</label>
	{@render children()}
	{#if error}
		<p class="error-text" id="{id}-error">{error}</p>
	{:else if hint}
		<p class="hint" id="{id}-hint">{hint}</p>
	{/if}
</div>
