<script lang="ts">
	import { getTreeMenuBarContext } from '$lib/contexts/treemenubar';
	import { send, receive } from '$lib/utils/transition';
	import { type TreeMenuItem, type TreePath } from '$lib/types/treemenubar';
	import { getNestedDataByPath, getChildrenByPath, getDataByPath, areEqualPaths } from './utils';
	import TreeMenuBarItem from './TreeMenuBarItem.svelte';

	interface Props {
		data: TreeMenuItem[];
		path: TreePath;
	}

	const { data, path }: Props = $props();

	const { menuItem, animated, toggle, handleKeyDown, expandedItems, tabbableItem } =
		getTreeMenuBarContext();

	const dataByPath = $derived(getDataByPath(data, path));
	const hasChildren = $derived(!!getChildrenByPath(data, path).length);
	const tabindex = $derived(
		tabbableItem()?.path && areEqualPaths(tabbableItem().path, path) ? 0 : -1
	);
	const expanded = $derived(
		hasChildren
			? !!expandedItems().find(({ path: expandedPath }) => areEqualPaths(expandedPath, path))
			: undefined
	);

	function handleChange(data: TreeMenuItem, event: Event) {
		console.log('handleMenuItemChange data:', data, 'event:', event);
	}
</script>

{#snippet _menuItem(dataByPath: TreeMenuItem)}
	{@render menuItem({
		data: dataByPath,
		level: path.length,
		tabindex,
		expanded,
		onmenuitemchange: (event: Event) => handleChange(dataByPath, event),
		onmenuitemkeydown: (event: KeyboardEvent) => handleKeyDown(dataByPath, event)
	})}
{/snippet}

{#snippet _menuItemWrapper(dataByPath: TreeMenuItem)}
	{#if hasChildren}
		<details
			ontoggle={(event: Event & { currentTarget: HTMLDetailsElement }) => {
				toggle({ data: dataByPath, expanded: event.currentTarget.open });
			}}
			open={!!expandedItems().find(({ path: expandedPath }) => areEqualPaths(expandedPath, path))}
		>
			<summary onkeydown={(event) => handleKeyDown(dataByPath, event)} tabindex={-1}>
				{@render _menuItem(dataByPath)}
			</summary>
			<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
			<menu role="menu" style={`--level:${path.length + 1}`}>
				{#each data.filter((item) => item.path.length === path.length + 1) as item (item.path)}
					<TreeMenuBarItem data={getNestedDataByPath(data, item.path)} path={item.path} />
				{/each}
			</menu>
		</details>
	{:else}
		{@render _menuItem(dataByPath)}
	{/if}
{/snippet}

{#if dataByPath}
	{#if animated}
		<li role="presentation" in:receive={{ key: path }} out:send={{ key: path }}>
			{@render _menuItemWrapper(dataByPath)}
		</li>
	{:else}
		<li role="presentation">
			{@render _menuItemWrapper(dataByPath)}
		</li>
	{/if}
{/if}

<style lang="postcss">
	@reference 'tailwindcss'

	summary {
		outline-offset: -2px;
	}
</style>
