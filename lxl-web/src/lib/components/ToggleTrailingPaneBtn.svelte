<script lang="ts">
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import { MediaQuery, SvelteURL } from 'svelte/reactivity';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { SELECTION_HASH } from '#lib/constants/modals.ts';
	import { getSelectionContext } from '#lib/contexts/selection.svelte.ts';
	import { getTrailingPaneContext } from '#lib/contexts/trailingPane.svelte.ts';
	import { getUserSettings } from '#lib/contexts/userSettings.ts';
	import { relativizeUrl } from '#lib/utils/http.ts';
	import BiLayoutSidebarReverse from '~icons/bi/layout-sidebar-reverse';

	const selection = getSelectionContext();
	const trailingPane = getTrailingPaneContext();
	const userSettings = getUserSettings();
	const limitReached = $derived(selection?.limitReached);
	const isSmallScreen = new MediaQuery('max-width: 640px', false);

	function showSelectionModal() {
		const url = new SvelteURL(page.url.toString());
		url.hash = SELECTION_HASH;

		const rel = relativizeUrl(url.toString()) as string;
		goto(resolve(rel), {
			state: { modalOpen: true },
			replace: true
		});
	}
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

{#if userSettings.selectableResults}
	{#if isSmallScreen.current}
		<!-- mobile btn -->
		<button
			id={trailingPane.expandBtnId}
			class="ml-auto btn btn-primary flex gap-1.5"
			aria-label={page.data.t('panes.show')}
			disabled={!selection.length}
			in:fade={{ duration: 200 }}
			onclick={showSelectionModal}
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
