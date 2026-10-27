<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let {
		busy = false,
		class: className = 'btn-primary',
		children,
		onclick,
		...rest
	}: HTMLButtonAttributes & { busy?: boolean; children: Snippet } = $props();

	// A form can have several buttons (Update, Remove); only the one that sent it spins.
	// Implicit submission (Enter in a field) clicks the default button, so this covers it too.
	let pressed = $state(false);
	$effect(() => {
		if (!busy) pressed = false;
	});
</script>

<!-- Disabled while busy, so a slow network can't send the same order or payout twice. -->
<button
	{...rest}
	class="btn {className}"
	class:is-busy={busy && pressed}
	disabled={busy || rest.disabled}
	aria-busy={(busy && pressed) || undefined}
	onclick={(e) => {
		pressed = true;
		// If validation stops the submit, busy never turns on; forget the press.
		setTimeout(() => {
			if (!busy) pressed = false;
		});
		onclick?.(e);
	}}
>
	{#if busy && pressed}<span class="spin" aria-hidden="true"></span>{/if}
	{@render children()}
</button>
