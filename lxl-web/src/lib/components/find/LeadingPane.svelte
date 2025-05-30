<script>
	import { LEADING_PANE_DEFAULT_WIDTH } from '$lib/constants/panels';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import Toolbar from '../Toolbar.svelte';
	const { children } = $props();
	const userSettings = getUserSettings();

	const paneOpen = $derived(userSettings.leadingPane?.open);
	const paneWidth = $state(LEADING_PANE_DEFAULT_WIDTH);
</script>

<section
	class="leading-pane relative hidden border-r border-r-neutral-200 bg-neutral-50 sm:block"
	style="width:{paneOpen ? paneWidth : 0}px"
>
	<div class="leading-pane-sticky sticky top-0 pb-6">
		<div class="leading-pane-toolbar sticky top-0 z-10 bg-neutral-50">
			<Toolbar>
				{#snippet trailingActions()}
					<button onclick={() => userSettings.closeLeadingPane()}>⬅️</button>
				{/snippet}
			</Toolbar>
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
