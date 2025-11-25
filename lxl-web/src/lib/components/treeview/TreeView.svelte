<script module lang="ts">
	export { treeItems };

	export class TreePath extends Array {
		constructor(path: string[]) {
			// @ts-expect-error: Argument of type 'string' is not assignable to parameter of type 'number'
			super(...path);
		}

		isEqualPath(otherPath: TreePath) {
			return (
				this.length === otherPath.length && this.every((part, index) => part === otherPath[index])
			);
		}
	}

	export interface TreeItem {
		path: TreePath;
		children?: TreeItem[]; // should we support nested tree data as well? Or just rely on TreePath directly?
	}
</script>

<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import { type TreeItemSnippet } from '$lib/types/treeview';
	import { setTreeViewContext } from '$lib/contexts/treeview';
	import { send, receive } from '$lib/utils/transition';
	import TreeViewItem from './TreeViewItem.svelte';

	interface Props {
		id?: string;
		ariaLabelledby?: string;
		ariaLabel?: string;
		selectable?: 'single' | 'multiple';
		animated?: boolean;
		data: TreeItem[];
		treeItem?: TreeItemSnippet;
		tabbablePath?: TreePath;
	}

	let {
		id,
		ariaLabelledby,
		ariaLabel,
		selectable,
		treeItem,
		animated = true,
		data,
		tabbablePath
	}: Props = $props();

	setTreeViewContext({
		treeItem,
		selectable,
		tabbablePath: tabbablePath || data.filter((item) => item.path.length === 1)?.[0].path, // data.find((item) => item.path.length === 1)?.path,
		animated: !prefersReducedMotion.current && animated
	});
</script>

{#snippet treeItems(data: TreeItem[], path?: TreePath, options?: { animated?: boolean })}
	{#if path}
		{@const dataFromPath: TreeItem[] = data.filter((item) => [...path].every((part, index) => part === item.path[index]))}
		{#if options?.animated}
			<li role="none" in:receive={{ key: path }} out:send={{ key: path }}>
				<TreeViewItem elementTag="div" data={dataFromPath} {path} />
			</li>
		{:else}
			<TreeViewItem elementTag="li" data={dataFromPath} {path} />
		{/if}
	{:else}
		{#each data.filter((item) => item.path.length === 1) as rootItem (rootItem.path)}
			{@render treeItems(data, rootItem.path)}
		{/each}
	{/if}
{/snippet}

<ul
	role="tree"
	{id}
	aria-labelledby={ariaLabelledby}
	aria-label={ariaLabel}
	aria-multiselectable={selectable === 'multiple' || undefined}
>
	{@render treeItems(data, undefined, { animated })}
</ul>

<style lang="postcss">
	@reference 'tailwindcss';
</style>
