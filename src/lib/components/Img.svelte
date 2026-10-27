<script lang="ts">
	import Icon from './Icon.svelte';

	// Fills an image box (.ph, .thumb, .thumb-s). Sellers paste links from elsewhere, so a
	// missing or broken image falls back to the placeholder icon.
	let {
		src,
		alt = '',
		size = 22,
		eager = false
	}: { src?: string | null; alt?: string; size?: number; eager?: boolean } = $props();

	let failed = $state<string>();
</script>

{#if src && failed !== src}
	<img {src} {alt} loading={eager ? 'eager' : 'lazy'} onerror={() => (failed = src)} />
{:else}
	<Icon name="image" {size} stroke={1.5} />
{/if}
