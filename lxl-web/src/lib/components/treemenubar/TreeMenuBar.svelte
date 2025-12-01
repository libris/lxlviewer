<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import {
		type TreeMenuItem,
		type TreeMenuItemSnippet,
		type TreeMenuItemSnippetParams,
		type ToggleHandlerParams,
		TreeMenuBarKeys
	} from '$lib/types/treemenubar';
	import { setTreeMenuBarContext } from '$lib/contexts/treemenubar';
	import TreeMenuBarItem from './TreeMenuBarItem.svelte';
	import { areEqualPaths, getChildrenByPath, getNestedDataByPath, getVisibleItems } from './utils';
	import { page } from '$app/state';

	interface Props {
		data: TreeMenuItem[];
		id?: string;
		ariaLabelledby?: string;
		ariaLabel?: string;
		animated?: boolean;
		menuItem?: TreeMenuItemSnippet;
		wrapKeyboardNavigation?: boolean;
	}

	let {
		data,
		id,
		ariaLabelledby,
		ariaLabel,
		animated = true,
		menuItem = fallbackMenuItem,
		wrapKeyboardNavigation = true
	}: Props = $props();

	let menuBar: HTMLMenuElement | undefined = $state();

	const rootItems = $derived(data.filter((item) => item.path.length === 1));
	let expandedItems: TreeMenuItem[] = $derived([]); // TODO: set initially opened paths using getExpanded function?
	let visibleItems: TreeMenuItem[] = $derived(getVisibleItems(data, expandedItems));

	function toggle({ data, expanded }: ToggleHandlerParams) {
		if (expanded && !expandedItems.find((item) => areEqualPaths(data.path, item.path))) {
			expandedItems = [...expandedItems, data];
		} else if (!expanded) {
			expandedItems = [...expandedItems.filter((item) => !areEqualPaths(data.path, item.path))];
		}
	}

	function focusItem(item: TreeMenuItem) {
		(menuBar?.querySelector(`[data-path="${item.path.join('.')}"]`) as HTMLElement)?.focus();
	}

	function gotoNextItem(currentItem: TreeMenuItem | null) {
		if (!currentItem) {
			focusItem(visibleItems[0]);
		} else {
			const currentIndex = visibleItems.findIndex(({ path: visiblePath }) =>
				areEqualPaths(visiblePath, currentItem.path)
			);
			const nextItem = currentIndex >= 0 ? visibleItems[currentIndex + 1] : undefined;
			if (nextItem) {
				focusItem(nextItem);
			} else if (wrapKeyboardNavigation) {
				focusItem(visibleItems[0]);
			}
		}
	}

	function gotoPreviousItem(currentItem: TreeMenuItem | null) {
		if (!currentItem) {
			focusItem(visibleItems[visibleItems.length - 1]);
		} else {
			const currentIndex = visibleItems.findIndex(({ path: visiblePath }) =>
				areEqualPaths(visiblePath, currentItem.path)
			);
			const previousItem = currentIndex > 0 ? visibleItems[currentIndex - 1] : undefined;
			if (previousItem) {
				focusItem(previousItem);
			} else if (wrapKeyboardNavigation) {
				focusItem(visibleItems[visibleItems.length - 1]);
			}
		}
	}

	function collapseOrGotoParent(currentItem: TreeMenuItem | null) {
		if (currentItem) {
			if (
				expandedItems.find(({ path: expandedPath }) =>
					areEqualPaths(expandedPath, currentItem.path)
				)
			) {
				expandedItems = [
					...expandedItems.filter(
						({ path: expandedPath }) => !areEqualPaths(expandedPath, currentItem.path)
					)
				];
			} else {
				const parentItem = data.find(({ path }) =>
					areEqualPaths(path, [...currentItem.path].slice(0, -1))
				);
				if (parentItem) focusItem(parentItem);
			}
		}
	}

	function expandOrGotoNextItem(currentItem: TreeMenuItem | null) {
		if (currentItem && getChildrenByPath(data, currentItem.path).length) {
			if (
				expandedItems.find(({ path: expandedPath }) =>
					areEqualPaths(expandedPath, currentItem.path)
				)
			) {
				gotoNextItem(currentItem);
			} else {
				expandedItems = [...expandedItems, currentItem];
			}
		}
	}

	function toggleItem(currentItem: TreeMenuItem | null) {
		if (currentItem && getChildrenByPath(data, currentItem.path).length) {
			const expanded = !expandedItems.find(({ path: expandedPath }) =>
				areEqualPaths(expandedPath, currentItem.path)
			);
			toggle({ data: currentItem, expanded });
		}
	}

	export function handleKeyDown(item: TreeMenuItem | null, event: KeyboardEvent) {
		if (
			Object.keys(TreeMenuBarKeys).includes(event.key) ||
			((event.target as HTMLElement).tagName !== 'SUMMARY' && event.key === TreeMenuBarKeys.Space)
		) {
			event.preventDefault();
			event.stopPropagation();

			switch (event.key) {
				case TreeMenuBarKeys.ArrowDown:
					gotoNextItem(item);
					break;
				case TreeMenuBarKeys.ArrowUp:
					gotoPreviousItem(item);
					break;
				case TreeMenuBarKeys.ArrowRight:
					expandOrGotoNextItem(item);
					break;
				case TreeMenuBarKeys.ArrowLeft:
					collapseOrGotoParent(item);
					break;
				case TreeMenuBarKeys.Home:
					focusItem(visibleItems[0]);
					break;
				case TreeMenuBarKeys.End:
					focusItem(visibleItems[visibleItems.length - 1]);
					break;
				case TreeMenuBarKeys.Space:
					toggleItem(item);
					break;
			}
		} else if (String.fromCharCode(event.keyCode).toLowerCase().match(/[a-z]/g)) {
			const firstItem = visibleItems.find((item) => item.searchString?.startsWith(event.key));
			if (firstItem) {
				focusItem(firstItem);
			} else {
				focusItem(visibleItems[0]);
			}
		}
	}

	setTreeMenuBarContext({
		menuItem,
		animated: !prefersReducedMotion.current && animated,
		toggle,
		handleKeyDown,
		expandedItems: () => expandedItems // is this the right way to fix reactivity?
	});
</script>

<!--
The following warning is probably a false alarm according to https://github.com/sveltejs/svelte/issues/8416
and https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/menu
 -->
<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<menu
	bind:this={menuBar}
	role="menubar"
	{id}
	aria-labelledby={ariaLabelledby}
	aria-label={ariaLabel}
>
	{#each rootItems as { path } (path)}
		<TreeMenuBarItem data={getNestedDataByPath(data, path)} {path} />
	{/each}
</menu>

{#snippet fallbackMenuItem({
	data,
	onmenuitemchange,
	onmenuitemkeydown
}: TreeMenuItemSnippetParams)}
	<a
		role="menuitem"
		href={page.url.pathname + page.url.search + page.url.hash}
		onclick={onmenuitemchange}
		onkeydown={onmenuitemkeydown}
		data-sveltekit-noscroll
		data-path={data.path.join('.')}
	>
		{JSON.stringify(data?.path)}
	</a>
{/snippet}

<style lang="postcss">
	@reference 'tailwindcss';
</style>
