<script lang="ts">
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n/index.js';

	type Image = { id: string; url: string; alt_text?: string };
	let { images, name }: { images: Image[]; name: string } = $props();

	let strip = $state<HTMLElement>();
	let shown = $state(0);
	let broken = $state<Record<string, boolean>>({});

	// Thumbnails are #anchors so they work without JavaScript; with it, scroll the strip
	// instead of jumping the whole page, and keep the counter in step with swipes.
	function pick(e: MouseEvent, i: number) {
		const slide = strip?.children[i] as HTMLElement | undefined;
		if (!strip || !slide) return;
		e.preventDefault();
		strip.scrollTo({ left: slide.offsetLeft - strip.offsetLeft, behavior: 'smooth' });
		shown = i;
	}

	function onscroll() {
		// Slides are the strip's width apart plus the 8px gap.
		if (strip) shown = Math.round(strip.scrollLeft / (strip.clientWidth + 8));
	}

	const alt = (image: Image) => image.alt_text || name;
</script>

<div class="vstack gap-12">
	<div class="frame">
		<div
			class="gallery"
			bind:this={strip}
			{onscroll}
			role="region"
			aria-label={t('product.photosOf', { name })}
		>
			{#each images as image, i (image.id)}
				<div class="ph gallery-main" id="photo-{i + 1}">
					{#if broken[image.id]}
						<Icon name="image" size={44} stroke={1.25} />
						<span class="ph-cap">{alt(image)}</span>
					{:else}
						<img
							src={image.url}
							alt={alt(image)}
							loading={i === 0 ? 'eager' : 'lazy'}
							onerror={() => (broken[image.id] = true)}
						/>
					{/if}
				</div>
			{:else}
				<div class="ph gallery-main" role="img" aria-label={name}>
					<Icon name="image" size={44} stroke={1.25} />
				</div>
			{/each}
		</div>
		{#if images.length > 1}
			<span class="ph-count" aria-hidden="true">{shown + 1} / {images.length}</span>
		{/if}
	</div>
	{#if images.length > 1}
		<nav class="thumbs" aria-label={t('product.photos')}>
			{#each images as image, i (image.id)}
				<a
					class="thumb"
					class:is-on={i === shown}
					href="#photo-{i + 1}"
					aria-label={t('product.photoN', { n: i + 1, count: images.length, alt: alt(image) })}
					aria-current={i === shown ? 'true' : undefined}
					onclick={(e) => pick(e, i)}
				>
					{#if broken[image.id]}
						<Icon name="image" />
					{:else}
						<img src={image.url} alt="" loading="lazy" />
					{/if}
				</a>
			{/each}
		</nav>
	{/if}
</div>

<style>
	.frame {
		position: relative;
	}
</style>
