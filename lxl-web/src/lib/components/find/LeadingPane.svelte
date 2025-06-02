<script>
	import { page } from '$app/state';
	import {
		LEADING_PANE_DEFAULT_WIDTH,
		LEADING_PANE_MAX_WIDTH,
		LEADING_PANE_MIN_WIDTH,
		LEADING_PANE_COLLAPSE_WIDTH
	} from '$lib/constants/panels';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import Draggable from '../Draggable.svelte';
	import Toolbar from '../Toolbar.svelte';
	import BiArrowBarLeft from '~icons/bi/arrow-bar-left';

	const { children } = $props();
	const userSettings = getUserSettings();

	const paneOpen = $derived(userSettings.leadingPane?.open);
	let paneWidth = $state(userSettings.leadingPane?.width || LEADING_PANE_DEFAULT_WIDTH);
	let isDragging = $state(false);

	function onDragEnd() {
		userSettings.setLeadingPaneWidth(paneWidth);
	}
</script>

<section
	class={[
		'leading-pane relative hidden w-0 border-b border-b-neutral-200 sm:block',
		// Enable transition for the collapse animation. But disable it while resizing the panel!
		!isDragging && 'transition-[padding] duration-150 ease-in motion-reduce:transition-none'
	]}
	style="padding-right:{paneOpen ? paneWidth : 0}px"
	inert={!paneOpen}
>
	<div
		class={[
			'leading-pane-sticky sticky top-0 pb-6',
			!isDragging && 'transition-transform duration-150 ease-in motion-reduce:transition-none',
			paneOpen ? 'translate-x-0' : '-translate-x-full'
		]}
		style="width:{paneWidth}px"
	>
		<div class="leading-pane-toolbar sticky top-0 z-10">
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
	<Draggable
		bind:width={paneWidth}
		side="right"
		minWidth={LEADING_PANE_MIN_WIDTH}
		maxWidth={LEADING_PANE_MAX_WIDTH}
		bind:isDragging
		{onDragEnd}
		collapseWidth={LEADING_PANE_COLLAPSE_WIDTH}
		collapseHandler={() => userSettings.closeLeadingPane()}
		expandHandler={() => userSettings.openLeadingPane()}
	/>
</section>

<style lang="postcss">
	@reference 'tailwindcss';

	.leading-pane,
	.leading-pane-toolbar {
		background: linear-gradient(90deg, var(--color-neutral-50) 95%, var(--color-neutral-100) 100%);
	}

	.leading-pane-sticky {
		scrollbar-width: thin;
		@variant sm {
			top: var(--app-bar-height-sm);
			max-height: calc(100vh - var(--app-bar-height-sm));
			overflow-x: auto;
		}
	}
</style>
