<script lang="ts">
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import { getSelectionContext } from '#lib/contexts/selection.svelte.ts';
	import BiLayoutSidebarReverse from '~icons/bi/layout-sidebar-reverse';
	import { getTrailingPaneContext } from '#lib/contexts/trailingPane.svelte.ts';
	import { getUserSettings } from '#lib/contexts/userSettings.ts';

	const selection = getSelectionContext();
	const trailingPane = getTrailingPaneContext();
	const userSettings = getUserSettings();
	const limitReached = $derived(selection.limitReached);
</script>

{#if userSettings.selectableResults && !trailingPane.visible}
	<button
		id={trailingPane.expandBtnId}
		class="ml-auto btn btn-primary flex gap-1.5"
		aria-label={page.data.t('panes.show')}
		aria-expanded={trailingPane.visible}
		aria-controls="trailing-pane"
		disabled={!trailingPane.canExpand}
		in:fade={{ duration: 200 }}
		onclick={trailingPane.onOpen}
		title={page.data.t('panes.show')}
	>
		<BiLayoutSidebarReverse class="size-4" />
		<span
			class={[
				'badge',
				selection.length > 0 ? (limitReached ? 'badge-warning' : 'badge-accent') : 'badge-disabled'
			]}
		>
			{selection.length}
		</span>
	</button>
{/if}
