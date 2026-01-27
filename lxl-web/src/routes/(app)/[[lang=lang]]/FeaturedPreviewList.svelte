<script lang="ts">
	import { type FeaturedSearch } from '$lib/remotes/homepage.remote';
	import SearchResultList from '$lib/components/SearchResultList.svelte';
	import { getHomepageContext } from '$lib/contexts/homepage';
	import { getFeaturedPreviews } from '$lib/remotes/homepage.remote';

	type Props = {
		featuredSearch: FeaturedSearch;
		ariaLabelledBy?: string;
	};

	let { featuredSearch, ariaLabelledBy }: Props = $props();

	const homepageContext = getHomepageContext();
	const previewParamsString = $derived(JSON.stringify(featuredSearch.previewParams));

	const previewsQuery = $derived(
		!homepageContext.previews?.[previewParamsString]
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
</script>

<SearchResultList
	items={previews?.items || []}
	type="horizontal"
	{ariaLabelledBy}
	placeholderItems={!previews && !previewsQuery?.current ? 10 : 0}
	withGradient
/>

<style lang="postcss">
	@reference "tailwindcss";
</style>
