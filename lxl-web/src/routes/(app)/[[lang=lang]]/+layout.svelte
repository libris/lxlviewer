<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import SiteFooter from './SiteFooter.svelte';
	import AppBar from './AppBar.svelte';
	import { page } from '$app/state';
	import { setHomepageContext } from '$lib/contexts/homepage';
	import { setSearchContext } from '$lib/contexts/search';

	const { children } = $props();

	const isHomeRoute = $derived(page.route.id === '/(app)/[[lang=lang]]');
	const isFindRoute = $derived(page.route.id === '/(app)/[[lang=lang]]/find');

	let homepageCache = $state({
		previews: undefined
	});

	setHomepageContext(homepageCache);

	let searchContextState = $state({
		finishedLoadingSuperSearch: false,
		superSearch: undefined,
		lastTouchedEditor: undefined,
		showSearchInAppBar: false
	});

	// Search context is later updated in the onMount lifecycle hook of SuperSearchWrapper.svelte (which is lazy-loaded)
	setSearchContext(searchContextState);
</script>

<svelte:head>
	<title>{getPageTitle(undefined, page.data.siteName)}</title>
	<link rel="unapi-server" type="application/xml" href={`/api/${page.data.locale}/cite`} />
</svelte:head>
<div class={['app contents', page.data.subsetMapping && 'subset']}>
	<AppBar />
	<main
		id="content"
		class={['@container flex flex-1 scroll-mt-24 flex-col', !isHomeRoute && 'content']}
	>
		{@render children()}
	</main>
	{#if !isFindRoute}
		<SiteFooter />
	{/if}
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
				--appbar-template-columns: 1fr minmax(0, 2fr) 1fr;
			}
		}
	}
</style>
