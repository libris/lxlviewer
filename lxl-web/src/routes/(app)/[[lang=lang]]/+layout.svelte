<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import SiteFooter from './SiteFooter.svelte';
	import AppBar from './AppBar2.svelte';
	import { page } from '$app/state';
	import { setHomepageContext } from '$lib/contexts/homepage';
	import { setSearchContext } from '$lib/contexts/search';
	import AppSearch from './AppSearch.svelte';

	const { children } = $props();

	const isHomeRoute = $derived(page.route.id === '/(app)/[[lang=lang]]');
	const isFindRoute = $derived(page.route.id === '/(app)/[[lang=lang]]/find');

	let prevScrollTop: number | undefined = $state();
	let scrollingBackwards = $state(false);

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

	function handleScroll() {
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		if (scrollTop < (prevScrollTop || 0)) {
			scrollingBackwards = true;
		} else {
			scrollingBackwards = false;
		}
		prevScrollTop = scrollTop;
	}

	$effect(() => {
		if (isFindRoute) {
			window.addEventListener('scroll', handleScroll);
		} else {
			window.removeEventListener('scroll', handleScroll);
		}
	});
</script>

<svelte:head>
	<title>{getPageTitle(undefined, page.data.siteName)}</title>
	<link rel="unapi-server" type="application/xml" href={`/api/${page.data.locale}/cite`} />
</svelte:head>
<div class="app contents">
	<AppBar />
	{#if isFindRoute}
		<div class="flex flex-1 flex-col">
			<div
				class={[
					'search-container bg-appbar border-b-primary-200 sticky top-0 z-50 flex items-center border-b px-2 transition-all sm:transition-none lg:hidden',
					scrollingBackwards && 'scrolling-backwards'
				]}
			>
				<AppSearch id="find-search" />
			</div>
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

	.search-container {
		min-height: var(--appbar-height);

		@variant sm {
			top: var(--appbar-height);
		}
	}

	.scrolling-backwards {
		top: var(--appbar-height);
	}
</style>
