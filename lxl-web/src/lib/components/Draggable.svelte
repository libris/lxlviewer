<script lang="ts">
	import { onDestroy } from 'svelte';
	import { throttleRAF } from '$lib/utils/throttle';
	import { browser } from '$app/environment';
	/**
	 * Create a resizable panel by adding this component inside a relative positioned element
	 * and pass the 'side' you want to add the drag handle to. Use bindable 'width' to set parent size.
	 */
	type DraggableProps = {
		width: number;
		side: 'left' | 'right';
		minWidth?: number;
		maxWidth?: number;
		isDragging?: boolean;
		disabled?: boolean;
		onDragEnd?: () => void;
		collapseWidth?: number;
		collapseHandler?: () => void;
		expandHandler?: () => void;
	};

	let {
		width = $bindable(0),
		isDragging = $bindable(false),
		minWidth = 200,
		maxWidth = 400,
		collapseWidth,
		side = 'right',
		disabled = false,
		onDragEnd,
		collapseHandler,
		expandHandler
	}: DraggableProps = $props();

	let dragHandle: HTMLDivElement | undefined = $state();
	let parent = $derived(dragHandle?.parentElement);
	let parentId = $derived(parent?.id);
	let parentRect: DOMRect | undefined;

	let collapsedWhileDragging = false;

	const onPointerMove = (e: PointerEvent) => {
		if ((disabled && !collapsedWhileDragging) || !parentRect) {
			return;
		}

		const start = side === 'right' ? parentRect?.left : parentRect?.right;
		const distanceFromStart = Math.round(side === 'right' ? e.clientX - start : start - e.clientX);

		// collapse panel if under collapse threshold
		if (collapseWidth && distanceFromStart < collapseWidth) {
			if (!collapsedWhileDragging) {
				collapsedWhileDragging = true;
				collapseHandler?.();
			}
			return;
		}

		// reopen if over threshold again during the same drag session
		if (collapseWidth && collapsedWhileDragging && distanceFromStart > collapseWidth) {
			expandHandler?.();
			collapsedWhileDragging = false;
		}

		width = Math.round(Math.min(Math.max(distanceFromStart, minWidth), maxWidth));
	};

	const throttledOnPointerMove = throttleRAF(onPointerMove);

	function handlePointerDown(e: PointerEvent) {
		e.preventDefault();
		isDragging = true;
		collapsedWhileDragging = false;
		parentRect = parent?.getBoundingClientRect();

		document.addEventListener('pointermove', throttledOnPointerMove);
		document.addEventListener('pointerup', onPointerUp, { once: true });
	}

	function onPointerUp() {
		document.removeEventListener('pointermove', throttledOnPointerMove);
		isDragging = false;
		onDragEnd?.();
	}

	onDestroy(() => {
		if (browser) {
			document.removeEventListener('pointermove', throttledOnPointerMove);
		}
	});
</script>

<!-- https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/ -->
<!-- https://github.com/w3c/aria-practices/issues/130#issuecomment-2301520761 -->
<div
	bind:this={dragHandle}
	class={[
		'draggable-btn absolute top-0 -mx-2 h-full w-4 cursor-col-resize',
		side === 'left' ? 'left-0' : 'right-0',
		disabled && 'pointer-events-none hidden'
	]}
	aria-disabled={disabled}
	tabindex="0"
	aria-label="resize me"
	role="slider"
	aria-valuenow={width}
	aria-valuemin={minWidth}
	aria-valuemax={maxWidth}
	aria-orientation="vertical"
	aria-controls={parentId}
	onpointerdown={handlePointerDown}
></div>

<style lang="postcss">
	@reference 'tailwindcss';

	.draggable-btn {
		&::before {
			width: 1px;
			height: auto;
			z-index: 2;
			background-color: var(--color-neutral-200);
		}

		&::after {
			width: 11px;
			background-color: --alpha(var(--color-neutral-500) / 10%);
			opacity: 0;
			transition: opacity 0.5s;
			border-radius: 3px;
		}

		&::before,
		&::after {
			content: '';
			margin: auto;
			position: absolute;
			top: 0px;
			bottom: 0px;
			left: 0;
			right: -1px;
		}

		&:hover::after {
			opacity: 1;
		}
	}
</style>
