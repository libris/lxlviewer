<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { afterNavigate, onNavigate } from '$app/navigation';
	import { type FeaturedSearch } from '$lib/remotes/homepage.remote';
	import SearchResultList from '$lib/components/SearchResultList.svelte';
	import { getHomepageContext } from '$lib/contexts/homepage';
	import { getFeaturedPreviews } from '$lib/remotes/homepage.remote';

	type Props = {
		featured: FeaturedSearch;
		ariaLabelledBy?: string;
		type?: 'horizontal' | 'grid';
		lazyload?: 'intersection' | 'mount';
		placeholderCount?: number;
	};

	let {
		featured,
		ariaLabelledBy,
		type = 'horizontal',
		lazyload = undefined,
		placeholderCount = 11
	}: Props = $props();

	let listElement: HTMLUListElement | undefined = $state();
	let observer: IntersectionObserver | undefined = $state();
	let fadeInImages: boolean | undefined = $state(true);
	let shouldGetPreviews = $derived(lazyload === 'mount');

	const homepageContext = getHomepageContext();
	const previewParamsString = $derived(JSON.stringify(featured.previewParams));

	const previewsQuery = $derived(
		!homepageContext.previews?.[previewParamsString] &&
			(!lazyload || (lazyload && shouldGetPreviews))
			? getFeaturedPreviews(featured.previewParams)
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

	function initObserver() {
		observer?.disconnect();
		if (lazyload === 'intersection') {
			observer = new IntersectionObserver(handleObserve, {});
			if (listElement) {
				observer.observe(listElement);
			}
		}
	}

	onNavigate((navigation) => {
		if (navigation?.from) {
			fadeInImages = false;
		}
	});

	afterNavigate(() => {
		if (lazyload === 'intersection') {
			initObserver();
		}
	});

	onMount(() => {
		if (lazyload === 'intersection') {
			initObserver();
		}
	});

	onDestroy(() => {
		observer?.disconnect();
	});
</script>

{#snippet previewPlaceholder()}
	<div class="placeholder-container @container">
		<div class="placeholder flex flex-col items-center"></div>
		<div class={['skeleton mb-2 w-full', type === 'grid' ? 'aspect-video' : 'aspect-square']}></div>
		<div class="skeleton bg-neutral my-0.5 h-3 w-1/3"></div>
		<div
			class="skeleton bg-neutral mt-1.25 mb-2.5 h-3.5 w-3/4 @min-[16rem]:mb-2.25 @min-[16rem]:h-3.75"
		></div>
		<div class="skeleton bg-neutral h-3 w-1/2"></div>
		<div class="skeleton bg-neutral mt-2 h-3 w-1/3"></div>
	</div>
{/snippet}

<div
	class={[
		'featured-previews contents',
		previews?.totalItems === 0 && 'empty',
		type === 'grid' ? 'grid-type' : 'horizontal-type'
	]}
>
	<SearchResultList
		items={previews?.items || []}
		{type}
		{ariaLabelledBy}
		ariaLive="polite"
		ariaBusy={!previews || previewsQuery?.loading ? true : false}
		placeholderItems={!previews && !previewsQuery?.current ? placeholderCount : 0}
		placeholderSnippet={previewPlaceholder}
		aspectRatio={type === 'grid' ? 'landscape' : 'square'}
		lazyImages
		{fadeInImages}
		bind:listElement
	/>
</div>

<style lang="postcss">
	@reference "tailwindcss";

	/* prevent vertical scroll on individual items? */
	.horizontal-type.featured-previews {
		& .placeholder-container,
		:global(article) {
			height: calc(100cqw + (var(--spacing) * 3) + 9rem);
		}
	}

	.grid-type.featured-previews {
		& .placeholder-container,
		:global(article) {
			height: calc(56.25cqw + (var(--spacing) * 3) + 9rem);
		}
	}
</style>
