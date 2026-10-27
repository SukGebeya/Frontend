<script lang="ts">
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n/index.js';

	let { url, label }: { url: string; label: string } = $props();
	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout>;

	async function copy() {
		try {
			await navigator.clipboard.writeText(url);
		} catch {
			// Older Android browsers without the async clipboard API.
			const input = document.createElement('input');
			input.value = url;
			document.body.append(input);
			input.select();
			document.execCommand('copy');
			input.remove();
		}
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="copy">
	<input
		class="input"
		readonly
		value={url}
		aria-label={label}
		onfocus={(e) => e.currentTarget.select()}
	/>
	<button
		type="button"
		class="btn {copied ? 'btn-secondary copied' : 'btn-primary'}"
		onclick={copy}
		aria-live="polite"
	>
		{#if copied}<Icon name="check" size={18} />{/if}
		{copied ? t('products.copied') : t('products.copyLink')}
	</button>
</div>
