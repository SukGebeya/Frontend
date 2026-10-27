<script lang="ts">
	import Alert from './Alert.svelte';
	import { t } from '#lib/i18n/index.js';
	import type { FormState } from '#lib/forms.svelte.js';

	let { form }: { form: FormState } = $props();
</script>

{#if form.message}
	<Alert tone="error" title={t('form.failed')}><span>{form.message}</span></Alert>
{:else if form.notice}
	<Alert tone="success" title={t(form.notice)} />
{/if}
