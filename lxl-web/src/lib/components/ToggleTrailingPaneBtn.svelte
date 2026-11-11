<script lang="ts">
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import { MediaQuery } from 'svelte/reactivity';
	import { SELECTION_HASH } from '#lib/constants/modals.ts';
	import { getSelectionContext } from '#lib/contexts/selection.svelte.ts';
	import { getTrailingPaneContext } from '#lib/contexts/trailingPane.svelte.ts';
	import { getUserSettings } from '#lib/contexts/userSettings.ts';
	import BiLayoutSidebarReverse from '~icons/bi/layout-sidebar-reverse';
	import { getModalContext } from '#lib/contexts/modal.svelte.ts';

	const selection = getSelectionContext();
	const modal = getModalContext();
	const trailingPane = getTrailingPaneContext();
	const userSettings = getUserSettings();
	const selectableResults = $derived(userSettings.selectableResults);
	const limitReached = $derived(selection?.limitReached);
	const isSmallScreen = new MediaQuery('max-width: 640px', false);
</script>

{#snippet content()}
	<BiLayoutSidebarReverse class="size-4" />
	<span
		class={[
			'badge',
			selection.length > 0 ? (limitReached ? 'badge-warning' : 'badge-accent') : 'badge-disabled'
		]}
	>
		{selection.length}
	</span>
{/snippet}

{#if selectableResults}
	{#if isSmallScreen.current}
		<!-- mobile btn -->
		<button
			id={trailingPane.expandBtnId}
			class="ml-auto btn btn-primary flex gap-1.5"
			aria-label={page.data.t('panes.show')}
			disabled={!selection.length}
			in:fade={{ duration: 200 }}
			onclick={() =>
				modal.onOpen({
					hash: SELECTION_HASH,
					type: 'selection'
				})}
			title={page.data.t('panes.show')}
		>
			{@render content()}
		</button>
	{:else if !trailingPane.visible}
		<!-- desktop btn -->
		<button
			id={trailingPane.expandBtnId}
			class="ml-auto btn btn-primary flex gap-1.5"
			aria-label={page.data.t('panes.show')}
			aria-expanded={trailingPane.visible}
			aria-controls="trailing-pane"
			disabled={!selection.length}
			in:fade={{ duration: 200 }}
			onclick={trailingPane.onOpen}
			title={page.data.t('panes.show')}
		>
			{@render content()}
		</button>
	{/if}
{/if}
