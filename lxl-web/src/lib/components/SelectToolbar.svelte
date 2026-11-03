<script lang="ts">
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import { getSelectionContext } from '#lib/contexts/selection.svelte.ts';
	import BiLayoutSidebarReverse from '~icons/bi/layout-sidebar-reverse';
	import { getTrailingPaneContext } from '#lib/contexts/trailingPane.svelte.ts';

	const selection = getSelectionContext();
	const trailinePane = getTrailingPaneContext();
</script>

{#if trailinePane.canExpand}
	<button
		id={trailinePane.expandBtnId}
		class="ml-auto btn btn-primary flex gap-1.5"
		aria-label={page.data.t('panes.show')}
		aria-expanded={trailinePane.visible}
		aria-controls="trailing-pane"
		in:fade={{ duration: 200 }}
		onclick={trailinePane.onOpen}
	>
		<BiLayoutSidebarReverse class="size-4" />
		{#if selection.length > 0}
			<span class="badge badge-accent">
				{selection.length}
			</span>
		{/if}
	</button>
{/if}
