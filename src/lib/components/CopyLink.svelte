<script lang="ts">
	import { t } from '#lib/i18n/index.js';

	let { url, label }: { url: string; label?: string } = $props();
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
		readonly
		value={url}
		aria-label={label ?? t('products.copyLink')}
		onfocus={(e) => e.currentTarget.select()}
	/>
	<button type="button" class="btn sm primary" onclick={copy}>
		{copied ? t('products.copied') : t('products.copyLink')}
	</button>
</div>

<style>
	.copy {
		display: flex;
		gap: 8px;
	}
	input {
		min-width: 0;
		flex: 1;
		font-size: 0.9rem;
	}
	button {
		flex-shrink: 0;
	}
</style>
