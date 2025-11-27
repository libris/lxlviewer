<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import type {
		TreeMenuItem,
		TreeMenuItemSnippet,
		TreeMenuItemSnippetParams
	} from '$lib/types/treemenubar';
	import { setTreeMenuBarContext } from '$lib/contexts/treemenubar';
	import TreeMenuBarItem from './TreeMenuBarItem.svelte';
	import { getDataByPath } from './utils';
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

	setTreeMenuBarContext({
		menuItem,
		animated: !prefersReducedMotion.current && animated
	});
</script>

<!--
The following warning is probably an false alarm according to https://github.com/sveltejs/svelte/issues/8416
and https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/menu
 -->
<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<menu
	role="menubar"
	{id}
	aria-labelledby={ariaLabelledby}
	aria-label={ariaLabel}
	aria-orientation="vertical"
>
	{#each rootItems as { path } (path)}
		<TreeMenuBarItem data={getDataByPath(data, path)} {path} />
	{/each}
</menu>

{#snippet fallbackMenuItem({ path }: TreeMenuItemSnippetParams)}
	<a role="menuitem" href={page.url.pathname + page.url.search + page.url.hash}>
		{JSON.stringify(path)}
	</a>
{/snippet}

<style lang="postcss">
	@reference 'tailwindcss';
</style>
