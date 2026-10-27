<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n/index.js';

	let {
		id,
		name = 'quantity',
		value = 1,
		min = 1,
		max,
		small = false,
		form,
		label
	}: {
		id: string;
		name?: string;
		value?: number;
		min?: number;
		max?: number;
		small?: boolean;
		/** The id of the form the input belongs to, when it sits outside it. */
		form?: string;
		/** Accessible name when there is no visible label. */
		label?: string;
	} = $props();

	let input = $state<HTMLInputElement>();
	let current = $state(0);
	// The buttons need JavaScript; until it runs, the plain number input does the job.
	let ready = $state(false);
	onMount(() => {
		current = input?.valueAsNumber ?? 0;
		ready = true;
	});

	$effect(() => {
		if (input && max != null && input.valueAsNumber > max) set(max);
	});

	function set(n: number) {
		if (!input) return;
		input.value = String(n);
		current = n;
		input.dispatchEvent(new Event('input', { bubbles: true }));
		input.dispatchEvent(new Event('change', { bubbles: true }));
	}

	function step(by: 1 | -1) {
		if (!input) return;
		if (by > 0) input.stepUp();
		else input.stepDown();
		set(input.valueAsNumber);
	}
</script>

<div class="qty" class:sm={small}>
	<button
		type="button"
		aria-label={t('product.decrease')}
		aria-controls={id}
		disabled={!ready || current <= min}
		onclick={() => step(-1)}><Icon name="minus" size={18} /></button
	>
	<input
		bind:this={input}
		{id}
		{name}
		{form}
		{min}
		{max}
		type="number"
		inputmode="numeric"
		required
		aria-label={label}
		defaultValue={value}
		oninput={() => (current = input?.valueAsNumber ?? 0)}
	/>
	<button
		type="button"
		aria-label={t('product.increase')}
		aria-controls={id}
		disabled={!ready || (max != null && current >= max)}
		onclick={() => step(1)}><Icon name="plus" size={18} /></button
	>
</div>
