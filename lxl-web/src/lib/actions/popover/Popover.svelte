<script lang="ts">
	import { onMount } from 'svelte';
	import { computePosition, offset, shift, inline, flip, arrow } from '@floating-ui/dom';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import type { ResourceData } from '$lib/types/resourceData';

	export let title: string | undefined = undefined;
	export let resourceData: ResourceData | undefined = undefined;
	export let referenceElement: HTMLElement;
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
				shift({ padding: 24 }),
				arrow({ element: arrowElement, padding: 8 }),
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
	Renders a popover.
	Note that `Popover.svelte` isn't intended to be used directly in page templates – use the `use:popover` instead (see `$lib/actions/popover`).
-->
<div
	class="bg-page text-2xs border-neutral absolute top-0 left-0 z-50 w-max max-w-sm rounded-md border shadow-xl"
	role="complementary"
	bind:this={popoverElement}
	on:mouseover={onMouseOver}
	on:mouseleave={onMouseLeave}
	on:focus={onFocus}
	on:blur={onBlur}
>
	<div class="p-2">
		{#if resourceData}
			<DecoratedData data={resourceData} block allowPopovers={false} />
		{:else if title}
			{title}
		{/if}
	</div>
	<div class="absolute" bind:this={arrowElement}>
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
