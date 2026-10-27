<script lang="ts">
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n/index.js';

	let { signedIn }: { signedIn: boolean } = $props();
</script>

<footer class="ftr">
	<div class="wrap">
		<div class="ftr-in">
			<div class="hstack gap-10">
				<span class="logo-m sm" aria-hidden="true">ገ</span>
				<span class="foot muted">{t('brand.tagline')}</span>
			</div>
			{#if signedIn}
				<form method="POST" action="/logout">
					<button class="btn btn-secondary btn-sm"
						><Icon name="logout" size={18} />{t('nav.logout')}</button
					>
				</form>
			{/if}
		</div>
	</div>
</footer>

<style>
	.hstack {
		min-height: 44px;
	}
</style>
