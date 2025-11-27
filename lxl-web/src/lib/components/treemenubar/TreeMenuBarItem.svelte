<script lang="ts">
	import { getTreeMenuBarContext } from '$lib/contexts/treemenubar';
	import { send, receive } from '$lib/utils/transition';
	import type { TreeMenuItem, TreePath } from '$lib/types/treemenubar';
	import { getNestedDataByPath, getChildrenByPath, getDataByPath } from './utils';
	import TreeMenuBarItem from './TreeMenuBarItem.svelte';

	interface Props {
		data: TreeMenuItem[];
		path: TreePath;
	}

	const { data, path }: Props = $props();

	const { menuItem, animated, toggle, onchange } = getTreeMenuBarContext();

	const dataByPath = $derived(getDataByPath(data, path));
	const hasChildren = $derived(!!getChildrenByPath(data, path).length);
</script>

{#snippet _menuItem(dataByPath: TreeMenuItem)}
	{@render menuItem({ data: dataByPath, onchange })}
{/snippet}

{#snippet _menuItemWrapper(dataByPath: TreeMenuItem)}
	{#if hasChildren}
		<details
			ontoggle={(event: Event & { currentTarget: HTMLDetailsElement }) => {
				toggle({ data: dataByPath, expanded: event.currentTarget.open });
			}}
		>
			<summary>{@render _menuItem(dataByPath)}</summary>
			<ul style={`--level:${path.length + 1}`}>
				{#each data.filter((item) => item.path.length === path.length + 1) as item (item.path)}
					<TreeMenuBarItem data={getNestedDataByPath(data, item.path)} path={item.path} />
				{/each}
			</ul>
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
	@reference 'tailwindcss';

	summary {
		outline-offset: -2px;
	}
</style>
