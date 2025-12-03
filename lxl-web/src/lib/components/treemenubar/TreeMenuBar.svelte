<script lang="ts">
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { beforeNavigate } from '$app/navigation';
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
	import { send, receive } from '$lib/utils/transition';

	interface Props {
		data: TreeMenuItem[];
		id?: string;
		ariaLabelledby?: string;
		ariaLabel?: string;
		animated?: boolean;
		menuItem?: TreeMenuItemSnippet;
		wrapKeyboardNavigation?: boolean;
		focusMenuBarParent?: () => void;
	}

	let {
		data,
		id,
		ariaLabelledby,
		ariaLabel,
		animated = true,
		menuItem = fallbackMenuItem,
		wrapKeyboardNavigation = true,
		focusMenuBarParent
	}: Props = $props();

	const TYPEAHEAD_TIMEOUT_DURATION = 500;

	let menuBar: HTMLMenuElement | undefined = $state();
	let searchString: string = $state('');
	let typeaheadTimeout: ReturnType<typeof setTimeout> | null = null;

	const rootItems = $derived(data.filter((item) => item.path.length === 1));
	let expandedItems: TreeMenuItem[] = $derived([]); // TODO: set initially opened paths using getExpanded function?
	let visibleItems: TreeMenuItem[] = $derived(getVisibleItems(data, expandedItems));
	let tabbableItem = $derived(visibleItems[0]);

	function toggle({ data, expanded }: ToggleHandlerParams) {
		if (expanded && !expandedItems.find((item) => areEqualPaths(data.path, item.path))) {
			expandedItems = [...expandedItems, data];
		} else if (!expanded) {
			expandedItems = [...expandedItems.filter((item) => !areEqualPaths(data.path, item.path))];
		}
	}

	function focusItem(item: TreeMenuItem) {
		tabbableItem = item;
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

	function clearTypehead() {
		searchString = '';
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
				case TreeMenuBarKeys.Escape:
					focusMenuBarParent?.();
			}
		}

		if (event.key.toLowerCase().match(/^\S$/g)) {
			event.stopPropagation();

			if (typeaheadTimeout) clearTimeout(typeaheadTimeout);
			typeaheadTimeout = setTimeout(clearTypehead, TYPEAHEAD_TIMEOUT_DURATION);
			searchString = (searchString || '') + event.key;

			let typeaheadItems = visibleItems.filter((item) =>
				item.searchString?.toLowerCase().startsWith(searchString)
			);

			/** Fallback to first character if there are no hits for search string with length */
			if (!typeaheadItems.length && searchString.length > 1) {
				typeaheadItems = visibleItems.filter((item) =>
					item.searchString?.toLowerCase().startsWith(searchString.charAt(0))
				);
			}

			const currentPath = document.activeElement?.getAttribute('data-path')?.split('.');
			const currentIndex = currentPath
				? typeaheadItems.findIndex((item) => areEqualPaths(item.path, currentPath))
				: undefined;

			const typeaheadFocus =
				(typeaheadItems.length > 1 &&
					typeaheadItems.find(
						(_, index) => typeof currentIndex === 'number' && index > currentIndex // Allows jumping between different typeahead results when pressing same character multiple times
					)) ||
				typeaheadItems[0];

			if (typeaheadFocus) focusItem(typeaheadFocus);
		}

		if (event.key === TreeMenuBarKeys.Backspace) {
			clearTypehead();
		}

		if (event.key === TreeMenuBarKeys.Escape) {
			tabbableItem = visibleItems[0];
		}
	}

	setTreeMenuBarContext({
		menuItem,
		animated: !prefersReducedMotion.current && animated,
		toggle,
		handleKeyDown,
		expandedItems: () => expandedItems, // is this the right way to fix reactivity?
		tabbableItem: () => tabbableItem
	});

	beforeNavigate(() => {
		if (typeaheadTimeout) clearTimeout(typeaheadTimeout);
		clearTypehead();
	});

	onMount(() => {
		return () => {
			if (typeaheadTimeout) clearTimeout(typeaheadTimeout);
			clearTypehead();
		};
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
	{#if animated}
		{#each rootItems as { path } (path)}
			<li role="presentation" in:receive={{ key: path }} out:send={{ key: path }} animate:flip>
				<TreeMenuBarItem data={getNestedDataByPath(data, path)} {path} />
			</li>
		{/each}
	{:else}
		{#each rootItems as { path } (path)}
			<TreeMenuBarItem data={getNestedDataByPath(data, path)} {path} />
		{/each}
	{/if}
</menu>

{#snippet fallbackMenuItem({
	data,
	tabindex,
	onmenuitemchange,
	onmenuitemkeydown
}: TreeMenuItemSnippetParams)}
	<a
		role="menuitem"
		href={page.url.pathname + page.url.search + page.url.hash}
		onclick={onmenuitemchange}
		onkeydown={onmenuitemkeydown}
		data-sveltekit-noscroll
		data-sveltekit-keepfocus
		data-path={data.path.join('.')}
		{tabindex}
	>
		{JSON.stringify(data?.path)}
	</a>
{/snippet}

<style lang="postcss">
	@reference 'tailwindcss';
</style>
