<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import SiteFooter from './SiteFooter.svelte';
	import AppBar from './AppBar2.svelte';
	import { page } from '$app/state';
	import { setHomepageContext } from '$lib/contexts/homepage';
	import { setSearchContext } from '$lib/contexts/search';

	const { children } = $props();

	const isHomeRoute = $derived(page.route.id === '/(app)/[[lang=lang]]');
	const isFindRoute = $derived(page.route.id === '/(app)/[[lang=lang]]/find');

	let homepageContextState = $state({
		showSearchInAppBar: false,
		previews: undefined
	});

	setHomepageContext(homepageContextState);

	let searchContext = $state({
		getQuery: () => page.url.searchParams.get('_q') || '',
		getSelection: () => undefined,
		showExpandedSearch: () => {},
		hideExpandedSearch: () => {},
		changeQuery: () => {},
		submit: () => {},
		initialStateBeforeMount: undefined,
		isMounted: false
	});

	// Search context is later updated in the onMount lifecycle hook of SuperSearchWrapper.svelte (which is lazy-loaded)
	setSearchContext(searchContext);
</script>

<svelte:head>
	<title>{getPageTitle(undefined, page.data.siteName)}</title>
	<link rel="unapi-server" type="application/xml" href={`/api/${page.data.locale}/cite`} />
</svelte:head>
<div class="app contents">
	<AppBar />
	{#if isFindRoute}
		<div class="flex flex-1 flex-col">
			{@render children()}
		</div>
	{:else}
		<main
			id="content"
			class={['@container flex flex-1 scroll-mt-24 flex-col', !isHomeRoute && 'content']}
		>
			{@render children()}
		</main>
		<SiteFooter />
	{/if}
	<div id="floating-elements-container"></div>
</div>

<style lang="postcss">
	@reference 'tailwindcss';

	.app {
		--appbar-height: var(--appbar-base);
		--appbar-template-areas: 'leading-actions trailing-actions';
		--appbar-template-rows: var(--appbar-height);
		--appbar-template-columns: 1fr 1fr;

		@variant sm {
			--appbar-height: var(--appbar-sm);
		}

		@variant lg {
			--appbar-height: var(--appbar-lg);
			--appbar-template-areas: 'leading-actions search trailing-actions';
			--appbar-template-columns: 1fr minmax(0, 3fr) 1fr;
		}

		@variant 2xl {
			--appbar-height: var(--appbar-2xl);
		}
	}
</style>
