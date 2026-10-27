<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n/index.js';

	let {
		id,
		label,
		error,
		hint,
		optional = false,
		suffix,
		children
	}: {
		id: string;
		label: string;
		error?: string;
		hint?: string;
		optional?: boolean;
		/** A unit shown inside the input (ETB); screen readers hear it as part of the label. */
		suffix?: string;
		children: Snippet;
	} = $props();

	// Links the control to its message. Pages only pass the control, so this sets the attributes on it.
	function describe(node: HTMLElement) {
		const control = node.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
		if (!control) return;
		if (error || hint) control.setAttribute('aria-describedby', `${id}-msg`);
		else control.removeAttribute('aria-describedby');
		if (error) control.setAttribute('aria-invalid', 'true');
		else control.removeAttribute('aria-invalid');
	}
</script>

<div class="field" class:is-invalid={!!error} {@attach describe}>
	<label class="label" for={id}>
		{label}{#if suffix}<span class="sr">{` (${suffix})`}</span>{/if}
		{#if optional}<span class="opt">({t('common.optional')})</span>{/if}
	</label>
	{#if suffix}
		<div class="affix">
			{@render children()}<span class="affix-end" aria-hidden="true">{suffix}</span>
		</div>
	{:else}
		{@render children()}
	{/if}
	{#if error}
		<p class="err" id="{id}-msg"><Icon name="error-circle" size={16} />{error}</p>
	{:else if hint}
		<p class="hint" id="{id}-msg">{hint}</p>
	{/if}
</div>
