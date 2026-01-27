<script lang="ts">
	import { onDestroy } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { type FeaturedSearch } from '$lib/remotes/homepage.remote';
	import SearchResultList from '$lib/components/SearchResultList.svelte';
	import { getHomepageContext } from '$lib/contexts/homepage';
	import { getFeaturedPreviews } from '$lib/remotes/homepage.remote';

	type Props = {
		featuredSearch: FeaturedSearch;
		ariaLabelledBy?: string;
		lazyload?: boolean;
	};

	let { featuredSearch, ariaLabelledBy, lazyload = false }: Props = $props();

	let listElement: HTMLUListElement | undefined = $state();
	let observer: IntersectionObserver | undefined = $state();
	let shouldGetPreviews = $derived(false);

	const homepageContext = getHomepageContext();
	const previewParamsString = $derived(JSON.stringify(featuredSearch.previewParams));

	const previewsQuery = $derived(
		!homepageContext.previews?.[previewParamsString] &&
			(!lazyload || (lazyload && shouldGetPreviews))
			? getFeaturedPreviews(featuredSearch.previewParams)
			: undefined
	);

	const previews = $derived(homepageContext?.previews?.[previewParamsString]);

	$effect(() => {
		if (previewsQuery?.current && !homepageContext.previews?.[previewParamsString]) {
			homepageContext.previews = {
				...homepageContext.previews,
				[previewParamsString]: previewsQuery.current
			};
		}
	});

	$effect(() => {
		if (previews) observer?.disconnect();
	});

	function handleObserve(entries: IntersectionObserverEntry[]) {
		if (entries[0].isIntersecting) shouldGetPreviews = true;
	}

	afterNavigate(() => {
		observer?.disconnect();

		if (lazyload) {
			observer = new IntersectionObserver(handleObserve, {});
			if (listElement) {
				observer.observe(listElement);
			}
		}
	});

	onDestroy(() => {
		observer?.disconnect();
	});
</script>

<SearchResultList
	items={previews?.items || []}
	type="horizontal"
	{ariaLabelledBy}
	ariaLive="polite"
	ariaBusy={!previews || previewsQuery?.loading ? true : false}
	placeholderItems={!previews && !previewsQuery?.current ? 10 : 0}
	withGradient
	bind:listElement
/>

<style lang="postcss">
	@reference "tailwindcss";
</style>
