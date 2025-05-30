<script>
	import Toolbar from '../Toolbar.svelte';
	const { children } = $props();
</script>

<section class="leading-pane relative hidden border-r border-r-neutral-200 bg-neutral-50 sm:block">
	<div class="leading-pane-sticky sticky top-0 pb-6">
		<div class="leading-pane-toolbar sticky top-0 z-10 bg-neutral-50">
			<Toolbar></Toolbar>
		</div>
		{@render children()}
	</div>
</section>

<style lang="postcss">
	@reference 'tailwindcss';

	.leading-pane {
		box-shadow: -3px 0px 12px 0px rgba(0, 0, 0, 0.04) inset;
	}

	.leading-pane-sticky {
		@variant sm {
			top: var(--app-bar-height-sm);
			max-height: calc(100vh - var(--app-bar-height-sm));
			overflow: auto;
		}
	}
</style>
