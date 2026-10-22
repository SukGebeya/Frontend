<script lang="ts">
	import Alert from './Alert.svelte';
	import { t } from '#lib/i18n/index.js';
	import type { FormState } from '#lib/forms.svelte.js';

	let { form }: { form: FormState } = $props();
</script>

{#if form.message}
	<Alert tone="error">{form.message}</Alert>
{:else if form.notice}
	<Alert tone="success">{t(form.notice)}</Alert>
{/if}
