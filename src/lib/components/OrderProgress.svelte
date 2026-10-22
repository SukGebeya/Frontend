<script lang="ts">
	import { t, type Key } from '#lib/i18n/index.js';

	let { status }: { status: string } = $props();

	const steps = ['paid', 'processing', 'shipped', 'delivered'] as const;
	const reached = $derived(steps.indexOf(status as (typeof steps)[number]));
</script>

{#if reached >= 0}
	<ol class="progress" aria-label="Order progress">
		{#each steps as step, i (step)}
			<li class:done={i <= reached} aria-current={i === reached ? 'step' : undefined}>
				<span class="dot" aria-hidden="true"></span>
				<span class="label">{t(`status.${step}` as Key)}</span>
			</li>
		{/each}
	</ol>
{/if}

<style>
	.progress {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
	}
	li {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		position: relative;
		font-size: 0.8rem;
		color: var(--muted);
		text-align: center;
	}
	li::before {
		content: '';
		position: absolute;
		top: 7px;
		right: 50%;
		width: 100%;
		height: 2px;
		background: var(--border);
	}
	li:first-child::before {
		display: none;
	}
	li.done::before {
		background: var(--accent);
	}
	.dot {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--surface);
		border: 2px solid var(--border);
		position: relative;
	}
	li.done .dot {
		background: var(--accent);
		border-color: var(--accent);
	}
	li.done {
		color: var(--text);
	}
</style>
