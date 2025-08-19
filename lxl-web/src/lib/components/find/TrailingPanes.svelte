<script lang="ts">
	import type { Snippet } from 'svelte';
	import Draggable from '../Draggable.svelte';
	import {
		LEADING_PANE_COLLAPSE_WIDTH,
		TRAILING_PANE_DEFAULT_WIDTH,
		TRAILING_PANE_MAX_WIDTH,
		TRAILING_PANE_MIN_WIDTH
	} from '$lib/constants/panels';
	import Toolbar from '../Toolbar.svelte';
	import { page } from '$app/state';
	import BiXLg from '~icons/bi/x-lg';
	import { getUserSettings } from '$lib/contexts/userSettings';

	type Props = {
		children?: Snippet;
		title: Snippet;
		close: () => void;
	};

	const { children, title, close }: Props = $props();

	const userSettings = getUserSettings();
	let paneWidth = $state(userSettings.trailingPane?.width || TRAILING_PANE_DEFAULT_WIDTH);
	let isDragging = $state(false);

	function handleOnResized() {
		userSettings.setTrailingPaneWidth(paneWidth);
	}
</script>

<section
	aria-label={page.data.t('panes.leadingPane')}
	id="leading-pane"
	class={[
		'leading-pane relative hidden w-0 border-b border-b-neutral-200 sm:block',
		// Enable transition for the collapse animation. But disable it while resizing the panel!
		!isDragging && 'transition-[padding] duration-150 ease-in motion-reduce:transition-none'
	]}
	style="padding-right:{paneWidth}px"
>
	<div
		class={[
			'leading-pane-wrapper sticky top-0',
			!isDragging && 'transition-transform duration-150 ease-in motion-reduce:transition-none'
		]}
		style="width:{paneWidth}px"
	>
		<div class="leading-pane-toolbar">
			<Toolbar>
				{#snippet leadingActions()}
					<p class="text-xs">
						{@render title?.()}
					</p>
				{/snippet}
				{#snippet trailingActions()}
					<button class="btn my-2" aria-label={page.data.t('panes.hide')} onclick={close}>
						<BiXLg class="size-4" />
					</button>
				{/snippet}
			</Toolbar>
		</div>
		<div class="leading-pane-content mr-1.5 pt-2 pb-6">
			{@render children?.()}
		</div>
	</div>
	<Draggable
		bind:width={paneWidth}
		side="left"
		minWidth={TRAILING_PANE_MIN_WIDTH}
		maxWidth={TRAILING_PANE_MAX_WIDTH}
		bind:isDragging
		collapseWidth={LEADING_PANE_COLLAPSE_WIDTH}
		oncollapse={() => {}}
		onexpand={() => {}}
		onresized={handleOnResized}
	/>
</section>

<style lang="postcss">
	@reference 'tailwindcss';

	.leading-pane,
	.leading-pane-toolbar {
		background: linear-gradient(90deg, var(--color-neutral-50) 95%, var(--color-neutral-100) 100%);
	}

	.leading-pane-wrapper {
		@variant sm {
			top: var(--app-bar-height);
		}
	}

	.leading-pane-content {
		max-height: calc(100vh - var(--app-bar-height) - var(--toolbar-height));
		overflow-y: auto;
		scrollbar-width: thin;
	}
</style>
