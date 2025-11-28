<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import type {
		TreeMenuItem,
		TreeMenuItemSnippet,
		TreeMenuItemSnippetParams,
		ToggleHandlerParams
	} from '$lib/types/treemenubar';
	import { setTreeMenuBarContext } from '$lib/contexts/treemenubar';
	import TreeMenuBarItem from './TreeMenuBarItem.svelte';
	import { areEqualPaths, getNestedDataByPath } from './utils';
	import { page } from '$app/state';

	interface Props {
		data: TreeMenuItem[];
		id?: string;
		ariaLabelledby?: string;
		ariaLabel?: string;
		animated?: boolean;
		menuItem?: TreeMenuItemSnippet;
	}

	let {
		data,
		id,
		ariaLabelledby,
		ariaLabel,
		animated = true,
		menuItem = fallbackMenuItem
	}: Props = $props();

	const rootItems = $derived(data.filter((item) => item.path.length === 1));
	let expandedItems: TreeMenuItem[] = $derived([]); // TODO: set initially opened paths using getExpanded function?

	function toggle({ data, expanded }: ToggleHandlerParams) {
		if (expanded && !expandedItems.find((item) => areEqualPaths(data.path, item.path))) {
			expandedItems = [...expandedItems, data];
		} else if (!expanded) {
			expandedItems = [...expandedItems.filter((item) => areEqualPaths(data.path, item.path))];
		}
	}

	setTreeMenuBarContext({
		menuItem,
		animated: !prefersReducedMotion.current && animated,
		toggle
	});
</script>

<!--
The following warning is probably an false alarm according to https://github.com/sveltejs/svelte/issues/8416
and https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/menu
 -->
<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<menu role="menubar" {id} aria-labelledby={ariaLabelledby} aria-label={ariaLabel}>
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
	>
		{JSON.stringify(data?.path)}
	</a>
{/snippet}

<style lang="postcss">
	@reference 'tailwindcss';
</style>
