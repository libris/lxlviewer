<script lang="ts">
	import type { ResourceData } from '$lib/types/ResourceData';
	import { onMount } from 'svelte';
	import { computePosition, offset, shift, inline, flip, arrow } from '@floating-ui/dom';
	import DecoratedData from '$lib/components/DecoratedData.svelte';

	export let referenceElement: HTMLElement;
	export let data: ResourceData;
	export let onMouseOver: (event: MouseEvent) => void;
	export let onMouseLeave: (event: MouseEvent) => void;
	export let onFocus: (event: FocusEvent) => void;
	export let onBlur: (event: FocusEvent) => void;

	let popoverElement: HTMLElement;
	let arrowElement: HTMLDivElement;

	const arrowWidth = 14;
	const arrowHeight = 8;

	function updatePosition() {
		computePosition(referenceElement, popoverElement, {
			middleware: [
				offset(8),
				shift(),
				arrow({ element: arrowElement, padding: 6 }),
				inline(),
				flip()
			]
		}).then(({ strategy, x, y, middlewareData, placement }) => {
			Object.assign(popoverElement.style, {
				position: strategy,
				left: `${x}px`,
				top: `${y}px`
			});
			if (middlewareData.arrow) {
				const { x: arrowX, y: arrowY } = middlewareData.arrow;

				Object.assign(arrowElement.style, {
					top:
						(arrowY != null && `${arrowY}px`) ||
						(placement === 'bottom' && `-${arrowWidth}px`) ||
						'',
					left:
						(arrowX != null && `${arrowX}px`) ||
						(placement === 'right' && `-${arrowWidth}px`) ||
						'',
					right: (arrowX == null && placement === 'left' && `-${arrowWidth}px`) || '',
					transform:
						(placement === 'right' && 'rotate(90deg)') ||
						(placement === 'bottom' && 'rotate(180deg)') ||
						(placement === 'left' && 'rotate(270deg)') ||
						''
				});
			}
		});
	}

	onMount(() => {
		updatePosition();
	});
</script>

<!-- 
  @component
	Renders a popover with decorated data.
	Note that `ResourcePopover.svelte` isn't intended to be used directly in page templates – use the `use:resourcePopover` action instead (see `$lib/actions/resourcePopover`).
-->
<div
	class="resource-popover"
	role="complementary"
	bind:this={popoverElement}
	on:mouseover={onMouseOver}
	on:mouseleave={onMouseLeave}
	on:focus={onFocus}
	on:blur={onBlur}
>
	<div class="content">
		<DecoratedData {data} />
	</div>
	<div class="popover-arrow" bind:this={arrowElement}>
		<svg
			aria-hidden="true"
			width={arrowWidth}
			height={arrowWidth}
			viewBox="0 0 {arrowWidth} {arrowWidth}"
		>
			<path d="M0 0L{arrowWidth / 2} {arrowHeight}L{arrowWidth} 0" fill="#fff" stroke="#c3c3c3" />
		</svg>
	</div>
</div>

<style>
	.resource-popover {
		background: #fff;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.19);
		border: 1px solid #c3c3c3;
		position: absolute;
		width: max-content;
		max-width: 360px;
		top: 0;
		left: 0;
		z-index: 100;
		font-size: 0.875rem;
		border-radius: 6px;
	}

	.content {
		padding: 0.5rem;
	}

	.popover-arrow {
		position: absolute;
	}
</style>
