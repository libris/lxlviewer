<script lang="ts">
	import { onMount } from 'svelte';
	import { computePosition, offset, shift, inline, flip, arrow } from '@floating-ui/dom';

	export type MenuItem = { label: string; action: () => void };

	type Props = {
		referenceElement: HTMLElement;
		onmouseover: (event: MouseEvent) => void;
		onmouseleave: (event: MouseEvent) => void;
		onfocus: (event: FocusEvent) => void;
		onblur: (event: FocusEvent) => void;
		menuItems?: MenuItem[];
	};

	const { referenceElement, onmouseover, onmouseleave, onfocus, onblur, menuItems }: Props =
		$props();

	let dropDownMenuElement: HTMLElement | undefined = $state();
	let arrowElement: HTMLDivElement | undefined = $state();

	const arrowWidth = 14;
	const arrowHeight = 8;

	function updatePosition() {
		computePosition(referenceElement, dropDownMenuElement, {
			middleware: [
				offset(8),
				shift({ padding: 24 }),
				arrow({ element: arrowElement, padding: 8 }),
				inline(),
				flip()
			]
		}).then(({ strategy, x, y, middlewareData, placement }) => {
			Object.assign(dropDownMenuElement.style, {
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
	Renders a drop down menu.
	Note that `DropDownMenu.svelte` isn't intended to be used directly in page templates – use the `use:dropDownMenu` instead (see `$lib/actions/dropDownMenu`).
-->
<div
	class="drop-down-menu"
	role="complementary"
	bind:this={dropDownMenuElement}
	{onmouseover}
	{onmouseleave}
	{onfocus}
	{onblur}
>
	<nav class="menu-items">
		<ul>
			{#each menuItems as item}
				<li><button type="button" onclick={item.action}>{item.label}</button></li>
			{/each}
		</ul>
	</nav>
	<div class="arrow" bind:this={arrowElement}>
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

<style lang="postcss">
	@reference "../../../app.css";

	.drop-down-menu {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 100;
		width: max-content;
		max-width: theme(maxWidth.sm);
		border: 1px solid rgb(var(--color-primary) / 0.32);
		border-radius: theme(borderRadius.sm);
		background: theme(backgroundColor.cards);
		font-size: theme(fontSize.sm);
		box-shadow: theme(boxShadow.xl);
	}

	.arrow {
		position: absolute;
	}

	.menu-items button {
		display: flex;
		align-items: center;
		text-align: left;
		padding: 0 theme(padding.4);
		width: 100%;
		min-height: 44px;
		cursor: pointer;

		&:hover {
			background: theme(backgroundColor.main);
		}
	}
</style>
