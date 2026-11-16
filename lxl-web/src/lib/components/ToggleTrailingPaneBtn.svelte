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
	const isSmallScreen = new MediaQuery('max-width: 640px', false);
</script>

{#snippet content()}
	<BiLayoutSidebarReverse class="size-4" />
	<span
		class={[
			'badge',
			selection.length > 0
				? selection.limitReached
					? 'badge-warning'
					: 'badge-accent'
				: 'badge-disabled'
		]}
	>
		{selection.length}
	</span>
{/snippet}

{#if userSettings.selectableResults}
	{#if isSmallScreen.current}
		<!-- mobile btn -->
		<button
			id={trailingPane.expandBtnId}
			class="btn btn-primary flex gap-1.5"
			disabled={!selection.length}
			aria-labelledby="selection-status"
			in:fade={{ duration: 200 }}
			onclick={() =>
				modal.onOpen({
					hash: SELECTION_HASH,
					state: { modal: 'selection' }
				})}
			title={page.data.t('panes.show')}
		>
			{@render content()}
		</button>
	{:else if !trailingPane.visible}
		<!-- desktop btn -->
		<button
			id={trailingPane.expandBtnId}
			class="btn btn-primary flex gap-1.5"
			aria-expanded={trailingPane.visible}
			aria-controls="trailing-pane"
			disabled={!selection.length}
			aria-labelledby="selection-status"
			in:fade={{ duration: 200 }}
			onclick={trailingPane.onOpen}
			title={page.data.t('panes.show')}
		>
			{@render content()}
		</button>
	{/if}
	<span id="selection-status" class="sr-only" role="status" aria-atomic="true">
		{`${selection.length} ${page.data.t('selection.selected')}`}
	</span>
{/if}
