<script lang="ts">
	import type { Snippet } from 'svelte';
	import Draggable from '../Draggable.svelte';
	import {
		TRAILING_PANE_COLLAPSE_WIDTH,
		TRAILING_PANE_DEFAULT_WIDTH,
		TRAILING_PANE_MAX_WIDTH,
		TRAILING_PANE_MIN_WIDTH
	} from '#lib/constants/panels.js';
	import Toolbar from '../Toolbar.svelte';
	import { page } from '$app/state';
	import BiXLg from '~icons/bi/x-lg';
	import { getUserSettings } from '#lib/contexts/userSettings.js';

	type Props = {
		children?: Snippet;
		title: Snippet;
		onClose: () => void;
		collapseTrailingPaneBtnId: string;
	};

	const { children, title, onClose, collapseTrailingPaneBtnId }: Props = $props();

	const userSettings = getUserSettings();

	const paneOpen = $derived(userSettings.trailingPane?.open);
	let paneWidth = $state(userSettings.trailingPane?.width || TRAILING_PANE_DEFAULT_WIDTH);
	let isDragging = $state(false);

	function handleOnResized() {
		userSettings.setTrailingPaneWidth(paneWidth);
	}
</script>

<div
	id="trailing-pane"
	class={[
		'trailing-pane sticky top-0 z-10 hidden w-0 sm:block print:hidden',
		// Enable transition for the collapse animation. But disable it while resizing the panel!
		!isDragging && 'transition-[padding] duration-150 ease-in motion-reduce:transition-none'
	]}
	style="padding-right:{paneOpen ? paneWidth : 0}px"
	inert={!paneOpen}
>
	<div
		class={[
			'flex h-full flex-col',
			!isDragging && 'transition-transform duration-150 ease-in motion-reduce:transition-none',
			paneOpen ? 'translate-x-0' : '-translate-x-full'
		]}
		style="width:{paneWidth}px"
	>
		<div class="trailing-pane-toolbar">
			<Toolbar>
				{#snippet leadingActions()}
					<p class="text-sm font-medium truncate">
						{@render title?.()}
					</p>
				{/snippet}
				{#snippet trailingActions()}
					<button
						id={collapseTrailingPaneBtnId}
						class="btn btn-primary my-2 border-0"
						aria-label={page.data.t('panes.hide')}
						aria-expanded={paneOpen}
						aria-controls="trailing-pane"
						onclick={onClose}
					>
						<BiXLg class="size-4" />
					</button>
				{/snippet}
			</Toolbar>
		</div>
		<div
			class="leading-pane-content p-4 mr-1.5 overflow-y-auto overscroll-contain *:h-full"
			style="--leading-pane-height:calc(100vh - var(--appbar-height) - var(--banner-height, 0))"
		>
			{@render children?.()}
		</div>
	</div>
	<Draggable
		bind:width={paneWidth}
		side="left"
		minWidth={TRAILING_PANE_MIN_WIDTH}
		maxWidth={TRAILING_PANE_MAX_WIDTH}
		bind:isDragging
		collapseWidth={TRAILING_PANE_COLLAPSE_WIDTH}
		oncollapse={() => userSettings.closeTrailingPane()}
		onexpand={() => userSettings.openTrailingPane()}
		onresized={handleOnResized}
	/>
</div>

<style lang="postcss">
	@reference 'tailwindcss';

	.trailing-pane {
		height: calc(100vh - var(--appbar-height) - var(--banner-height, 0));
		top: calc(var(--appbar-height) + var(--banner-height, 0));
	}

	.trailing-pane,
	.trailing-pane-toolbar {
		background: linear-gradient(90deg, var(--color-neutral-100) 0%, var(--color-aside) 10px);
	}

	/* .trailing-pane-wrapper {
		@variant sm {
			top: var(--appbar-height);
		}
	} */

	.trailing-pane-content {
		height: 100%;
		max-height: calc(
			100vh - var(--appbar-height) - var(--banner-height, 0) - var(--toolbar-height, 0)
		);
		scrollbar-width: thin;
	}
</style>
