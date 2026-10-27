<script lang="ts">
	import Icon from './Icon.svelte';
	import { t, type Key } from '#lib/i18n/index.js';

	let { status }: { status: string } = $props();

	const steps = ['paid', 'processing', 'shipped', 'delivered'] as const;
	const reached = $derived(steps.indexOf(status as (typeof steps)[number]));
	const finished = $derived(status === 'delivered');
</script>

{#if reached >= 0}
	<ol class="steps" aria-label={t('order.progress')}>
		{#each steps as step, i (step)}
			{@const done = i < reached || finished}
			{@const now = i === reached && !finished}
			<li class="step" class:done class:now aria-current={now ? 'step' : undefined}>
				<span class="dot"
					>{#if done}<Icon name="check" size={14} stroke={3} />{/if}</span
				>
				{t(`status.${step}` as Key)}
			</li>
		{/each}
	</ol>
{/if}
