<script>
	import { page } from '$app/state';
	import { LEADING_PANE_DEFAULT_WIDTH } from '$lib/constants/panels';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import Toolbar from '../Toolbar.svelte';
	import BiArrowBarLeft from '~icons/bi/arrow-bar-left';

	const { children } = $props();
	const userSettings = getUserSettings();

	const paneOpen = $derived(userSettings.leadingPane?.open);
	const paneWidth = $state(LEADING_PANE_DEFAULT_WIDTH);
</script>

<section
	class="leading-pane relative hidden w-0 border-r border-b border-r-neutral-200 border-b-neutral-200 bg-neutral-50 transition-[padding] duration-200 motion-reduce:transition-none sm:block"
	style="padding-right:{paneOpen ? paneWidth : 0}px"
	inert={!paneOpen}
>
	<div
		class={[
			'leading-pane-sticky sticky top-0 pb-6 transition-transform duration-200 motion-reduce:transition-none',
			paneOpen ? 'translate-x-0' : '-translate-x-full'
		]}
		style="width:{paneWidth}px"
	>
		<div class="leading-pane-toolbar sticky top-0 z-10 bg-neutral-50">
			<Toolbar>
				{#snippet trailingActions()}
					<button
						class="btn btn-primary"
						aria-label={page.data.t('panes.hide')}
						onclick={() => userSettings.closeLeadingPane()}
					>
						<BiArrowBarLeft class="size-4" />
					</button>
				{/snippet}
			</Toolbar>
		</div>
		{@render children()}
	</div>
</section>

<style lang="postcss">
	@reference 'tailwindcss';

	.leading-pane {
		box-shadow: -3px -3px 12px 0px rgba(0, 0, 0, 0.04) inset;
	}

	.leading-pane-sticky {
		scrollbar-width: thin;
		@variant sm {
			top: var(--app-bar-height-sm);
			max-height: calc(100vh - var(--app-bar-height-sm));
			overflow: auto;
		}
	}
</style>
