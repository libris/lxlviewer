<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { type FeaturedSearch } from '$lib/remotes/homepage.remote';
	import SearchResultList from '$lib/components/SearchResultList.svelte';
	import { getHomepageContext } from '$lib/contexts/homepage';
	import { getFeaturedPreviews } from '$lib/remotes/homepage.remote';

	type Props = {
		featuredSearch: FeaturedSearch;
		ariaLabelledBy?: string;
		lazyload?: 'intersection' | 'mount';
	};

	let { featuredSearch, ariaLabelledBy, lazyload = undefined }: Props = $props();

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

		if (lazyload === 'intersection') {
			observer = new IntersectionObserver(handleObserve, {});
			if (listElement) {
				observer.observe(listElement);
			}
		}
	});

	onMount(() => {
		if (lazyload === 'mount') {
			shouldGetPreviews = true;
		}
	});

	onDestroy(() => {
		observer?.disconnect();
	});
</script>

{#snippet previewPlaceholder()}
	<div class="flex flex-col items-center">
		<div class="skeleton mb-2 aspect-square w-full"></div>
		<div class="skeleton bg-neutral my-0.5 h-3 w-1/3"></div>
		<div
			class="skeleton bg-neutral mt-1.25 mb-2.5 h-3.5 w-3/4 @min-[16rem]:mb-2.25 @min-[16rem]:h-3.75"
		></div>
		<div class="skeleton bg-neutral h-3 w-1/2"></div>
		<div class="skeleton bg-neutral mt-2 h-3 w-1/3"></div>
	</div>
{/snippet}

<SearchResultList
	items={previews?.items || []}
	type="horizontal"
	{ariaLabelledBy}
	ariaLive="polite"
	ariaBusy={!previews || previewsQuery?.loading ? true : false}
	placeholderItems={!previews && !previewsQuery?.current ? 10 : 0}
	placeholderSnippet={previewPlaceholder}
	withGradient
	bind:listElement
/>

<style lang="postcss">
	@reference "tailwindcss";
</style>
