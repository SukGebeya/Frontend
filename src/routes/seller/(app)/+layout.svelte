<script lang="ts">
	import SellerNav from '#lib/components/SellerNav.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<div class="shell">
	<SellerNav profile={data.profile} />
	<div class="vstack gap-24">
		{@render children()}
	</div>
</div>
