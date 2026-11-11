<script lang="ts">
	import { page } from '$app/state';
	import { MediaQuery } from 'svelte/reactivity';
	import getPageTitle from '#lib/utils/getPageTitle.js';
	import { setHomepageContext } from '#lib/contexts/homepage.js';
	import { setSearchContext } from '#lib/contexts/search.js';
	import { getSelectionContext } from '#lib/contexts/selection.svelte.ts';
	import { getModalContext } from '#lib/contexts/modal.svelte.ts';
	import SiteFooter from './SiteFooter.svelte';
	import AppBar from './AppBar.svelte';
	import Modal from '#lib/components/Modal.svelte';
	import TrailingPane from '#lib/components/TrailingPane.svelte';
	import Selection from '#lib/components/Selection.svelte';

	const { children } = $props();

	const isHomeRoute = $derived(page.route.id === '/(app)/[[lang=lang]]');
	const isFindRoute = $derived(page.route.id === '/(app)/[[lang=lang]]/find');
	const trailingPaneAllowedRoute = $derived(
		page.route.id === '/(app)/[[lang=lang]]/find' ||
			page.route.id === '/(app)/[[lang=lang]]/[...resource=resource]'
	);

	let homepageCache = $state({
		previews: undefined
	});

	const selection = getSelectionContext();
	const modal = getModalContext();

	setHomepageContext(homepageCache);

	let searchContextState = $state({
		superSearch: undefined,
		lastTouchedEditor: undefined,
		finishedLoadingSuperSearch: false,
		showSearchInAppBar: false,
		q: ''
	});

	const isSmallScreen = new MediaQuery('max-width: 640px', false);
	const selectionModalOpen = $derived(modal.isOpen === 'selection');

	// Search context is later updated in the onMount lifecycle hook of SuperSearchWrapper.svelte (which is lazy-loaded)
	setSearchContext(searchContextState);
</script>

<svelte:head>
	<title>{getPageTitle(undefined, page.data.siteName)}</title>
	<link rel="unapi-server" type="application/xml" href={`/api/${page.data.locale}/cite`} />
</svelte:head>
<div class={['app contents', page.data.subsetMapping && 'subset']}>
	<AppBar />
	<div class="content-wrapper flex">
		<div class="main-wrapper flex-1">
			<main
				id="content"
				class={['@container flex flex-1 scroll-mt-24 flex-col', !isHomeRoute && 'content']}
			>
				{@render children()}
			</main>
			{#if !isFindRoute}
				<SiteFooter />
			{/if}
		</div>
		{#if trailingPaneAllowedRoute}
			{#if isSmallScreen.current && selectionModalOpen}
				<Modal close={() => modal.onClose('selection')}>
					{#snippet title()}
						<span class="p-1">Hantera ditt urval ({selection.length})</span>
					{/snippet}
					<Selection />
				</Modal>
			{:else if !isSmallScreen.current}
				<TrailingPane>
					{#snippet title()}
						<span>Hantera ditt urval</span>
						<!-- todo: sr-only atomic -->
						<span role="status" aria-atomic="true" class="font-medium badge badge-accent ml-0.5">
							{selection.length}
						</span>
					{/snippet}
					<Selection />
				</TrailingPane>
			{/if}
		{/if}
	</div>
	<div id="floating-elements-container"></div>
</div>

<style lang="postcss">
	@reference 'tailwindcss';

	.app {
		--appbar-height: var(--appbar-base);
		--appbar-template-areas: 'leading-actions search trailing-actions';
		--appbar-template-rows: var(--appbar-height) 0;
		--appbar-template-columns: fit-content 0 fit-content;

		@variant lg {
			--appbar-height: var(--appbar-lg);
			--appbar-template-columns: 1fr minmax(0, 3fr) 1fr;
		}

		@variant 2xl {
			--appbar-height: var(--appbar-2xl);
		}

		&.subset {
			@variant lg {
				--appbar-template-columns: minmax(360px, 400px) minmax(0, 2fr) 1fr;
			}
		}
	}

	/* set a different --appbar-height for the find route content (two rows of content) */
	.content-wrapper:global(:has(.search-result)) {
		--appbar-height: var(--appbar-find-base);

		@variant md {
			--appbar-height: var(--appbar-find-md);
		}

		@variant lg {
			--appbar-height: var(--appbar-find-lg);
		}

		@variant 2xl {
			--appbar-height: var(--appbar-find-2xl);
		}
	}

	/* TODO SCROLL IN MAIN CONTAINER? */
	/* :global(.content-wrapper:has(#trailing-pane)){
		max-height: calc(100vh - (var(--appbar-height) + var(--banner-height, 0)));
		overflow: hidden;

		& .main-wrapper {
			overflow-y: auto;
			scrollbar-width: thin;
		}
	} */
</style>
