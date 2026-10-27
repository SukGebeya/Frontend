<script lang="ts" module>
	// Stroke icons from the design (24×24, stroke 1.75). Circles and rects are written as paths so each icon is one <path>.
	const paths = {
		'arrow-in': 'M12 19V5M6 13l6 6 6-6',
		'arrow-out': 'M12 5v14M6 11l6-6 6 6',
		bag: 'M5.5 8h13l-1.1 11.2a1 1 0 0 1-1 .8H7.6a1 1 0 0 1-1-.8L5.5 8ZM9 10V7a3 3 0 0 1 6 0v3',
		box: 'M4 7.5 12 4l8 3.5v9L12 20l-8-3.5v-9ZM4 7.5 12 11l8-3.5M12 11v9',
		card: 'M5.5 6h13a2.5 2.5 0 0 1 2.5 2.5v8a2.5 2.5 0 0 1 -2.5 2.5h-13a2.5 2.5 0 0 1 -2.5 -2.5v-8a2.5 2.5 0 0 1 2.5 -2.5ZM3 10.5h18',
		check: 'm5 12.5 4.5 4.5L19 7.5',
		'check-circle': 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0ZM8.5 12.2l2.3 2.3 4.7-4.8',
		'chevron-down': 'm6 9 6 6 6-6',
		'chevron-left': 'm15 6-6 6 6 6',
		'chevron-right': 'm9 6 6 6-6 6',
		clock: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0ZM12 7v5l3 2',
		'error-circle': 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0ZM12 7.5v5M12 16v.5',
		external: 'M8 16 16 8M9.5 8H16v6.5',
		grid: 'M4.5 4.5h6v6h-6zM13.5 4.5h6v6h-6zM4.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z',
		help: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0ZM9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.6M12 17v.2',
		image:
			'M5.5 4h13a2.5 2.5 0 0 1 2.5 2.5v11a2.5 2.5 0 0 1 -2.5 2.5h-13a2.5 2.5 0 0 1 -2.5 -2.5v-11a2.5 2.5 0 0 1 2.5 -2.5ZM7.25 10a1.75 1.75 0 1 0 3.5 0a1.75 1.75 0 1 0 -3.5 0ZM21 16l-5-5-9 9',
		info: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0ZM12 11v5M12 7.5v.5',
		logout: 'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h10',
		menu: 'M4 9h16M4 15h16',
		minus: 'M5 12h14',
		mobile:
			'M9 2.5h6a3 3 0 0 1 3 3v13a3 3 0 0 1 -3 3h-6a3 3 0 0 1 -3 -3v-13a3 3 0 0 1 3 -3ZM10.5 18.5h3',
		phone:
			'M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z',
		pin: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21ZM9.5 9.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0Z',
		plus: 'M12 5v14M5 12h14',
		receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3ZM9 8h6M9 12h6',
		'receipt-lines': 'M6 3h12v18l-3-2-3 2-3-2-3 2V3ZM9 8h6M9 12h6M9 16h3',
		refresh: 'M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4',
		shield: 'M12 3 5 6v5.5c0 4.2 2.9 7.9 7 9.5 4.1-1.6 7-5.3 7-9.5V6l-7-3ZM9 12l2.2 2.2L15.5 10',
		sliders: 'M4 7h9M17 7h3M15 5v4M4 17h3M11 17h9M9 15v4',
		store:
			'M4 9.5 5.5 4h13L20 9.5M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0M5.5 11.5V20h13v-8.5M10 20v-5h4v5',
		trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
		truck:
			'M3 7h11v9H3zM14 10h4l3 3v3h-7M5.5 17.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0ZM15.5 17.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0Z',
		wallet:
			'M5 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2ZM3 10.5h18M15.5 15h2.5',
		warning: 'M12 4 2.8 19.5h18.4L12 4ZM12 10v4M12 16.8v.2',
		x: 'm7 7 10 10M17 7 7 17',
		'x-circle': 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0ZM9 9l6 6M15 9l-6 6'
	} as const;

	export type IconName = keyof typeof paths;
</script>

<script lang="ts">
	let {
		name,
		size = 20,
		stroke,
		class: className = ''
	}: { name: IconName; size?: number; stroke?: number; class?: string } = $props();
</script>

<svg
	class="i {className}"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	aria-hidden="true"
	style:stroke-width={stroke}><path d={paths[name]} /></svg
>
