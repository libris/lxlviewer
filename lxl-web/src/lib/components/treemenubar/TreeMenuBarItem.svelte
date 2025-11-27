<script lang="ts">
	import { getTreeMenuBarContext } from '$lib/contexts/treemenubar';
	import { send, receive } from '$lib/utils/transition';
	import type { TreeMenuItem, TreePath } from '$lib/types/treemenubar';
	import { getDataByPath, getChildrenByPath } from './utils';
	import TreeMenuBarItem from './TreeMenuBarItem.svelte';

	interface Props {
		data: TreeMenuItem[];
		path: TreePath;
	}

	const { data, path }: Props = $props();

	const { menuItem, animated } = getTreeMenuBarContext();

	const hasChildren = $derived(!!getChildrenByPath(data, path).length);
</script>

{#snippet _menuItemWrapper()}
	{#if hasChildren}
		<details>
			<summary>{@render menuItem({ path })}</summary>
			<ul style={`--level:${path.length + 1}`}>
				{#each data.filter((item) => item.path.length === path.length + 1) as item (item.path)}
					<TreeMenuBarItem data={getDataByPath(data, item.path)} path={item.path} />
				{/each}
			</ul>
		</details>
	{:else}
		{@render menuItem({ path })}
	{/if}
{/snippet}

{#if animated}
	<li role="presentation" in:receive={{ key: path }} out:send={{ key: path }}>
		{@render _menuItemWrapper()}
	</li>
{:else}
	<li role="presentation">
		{@render _menuItemWrapper()}
	</li>
{/if}

<style lang="postcss">
	@reference 'tailwindcss';

	summary {
		outline-offset: -2px;
	}
</style>
