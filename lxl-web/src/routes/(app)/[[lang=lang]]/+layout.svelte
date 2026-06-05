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

	console.log('scrollingBackwards', scrollingBackwards);

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
		--appbar-template-columns: 1fr 0 1fr;

		@variant sm {
			--appbar-height: var(--appbar-sm);
		}

		@variant lg {
			--appbar-template-columns: 1fr minmax(0, 3fr) 1fr;
		}

		@variant 2xl {
			--appbar-height: var(--appbar-2xl);
		}
	}
</style>
