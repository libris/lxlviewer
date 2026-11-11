<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getUserSettings } from '#lib/contexts/userSettings.js';
	import { getTrailingPaneContext } from '#lib/contexts/trailingPane.svelte.ts';
	import {
		TRAILING_PANE_COLLAPSE_WIDTH,
		TRAILING_PANE_MAX_WIDTH,
		TRAILING_PANE_MIN_WIDTH
	} from '#lib/constants/panels.js';
	import Draggable from '#lib/components/Draggable.svelte';
	import Toolbar from '#lib/components/Toolbar.svelte';
	import { page } from '$app/state';
	import BiXLg from '~icons/bi/x-lg';

	type Props = {
		children?: Snippet;
		title: Snippet;
	};

	const { children, title }: Props = $props();

	const userSettings = getUserSettings();
	const trailingPane = getTrailingPaneContext();
	const visible = $derived(trailingPane.visible);

	let paneWidth = $state(trailingPane?.width);
	let isDragging = $state(false);

	function handleOnResized() {
		trailingPane.setWidth(paneWidth);
	}
</script>

{#if visible}
	<aside
		id="trailing-pane"
		class={['trailing-pane z-10 hidden w-0 sm:block print:hidden']}
		style="padding-right:{trailingPane.visible ? paneWidth : 0}px"
		inert={!trailingPane.visible}
		aria-labelledby="trailing-pane-title"
	>
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
		<div class={['flex h-full flex-col']} style="width:{paneWidth}px">
			<div class="trailing-pane-toolbar">
				<Toolbar>
					{#snippet leadingActions()}
						<p
							class="text-sm font-medium truncate flex gap-1 items-center"
							id="trailing-pane-title"
						>
							{@render title?.()}
						</p>
					{/snippet}
					{#snippet trailingActions()}
						<button
							id={trailingPane.collapseBtnId}
							class="btn btn-primary my-2 border-0"
							aria-label={page.data.t('panes.hide')}
							aria-expanded={trailingPane.visible}
							aria-controls="trailing-pane"
							onclick={trailingPane.onClose}
						>
							<BiXLg class="size-4" />
						</button>
					{/snippet}
				</Toolbar>
			</div>
			<div class="trailing-pane-content p-4 mr-1.5 overflow-y-auto overscroll-contain *:h-full">
				{@render children?.()}
			</div>
		</div>
	</aside>
{/if}

<style lang="postcss">
	@reference 'tailwindcss';

	.trailing-pane {
		position: sticky;
		height: calc(100vh - var(--appbar-height) - var(--banner-height, 0));
		top: calc(var(--appbar-height) + var(--banner-height, 0));
	}

	.trailing-pane,
	.trailing-pane-toolbar {
		background: linear-gradient(90deg, var(--color-neutral-100) 0%, var(--color-aside) 10px);
	}

	.trailing-pane-content {
		height: 100%;
		max-height: calc(
			100vh - var(--appbar-height) - var(--banner-height, 0) - var(--toolbar-height, 0)
		);
		scrollbar-width: thin;
	}
</style>
