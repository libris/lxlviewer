<script lang="ts">
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { afterNavigate, goto } from '$app/navigation';
	import getPageTitle from '$lib/utils/getPageTitle';
	import getMetaDescription from '$lib/utils/getMetaDescription';
	import { JsonLd } from '$lib/types/xl.js';
	import { type CitationsType } from '$lib/types/citation.js';
	import { getLibraryIdsFromMapping } from '$lib/utils/getLibraryIdsFromMapping';
	import { relativizeUrl, stripAnchor, trimSlashes } from '$lib/utils/http.js';
	import Resource from '$lib/components/Resource.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Meta from '$lib/components/Meta.svelte';
	import Citations from '$lib/components/Citations.svelte';
	import HoldingsContent from '$lib/components/HoldingsContent.svelte';
	import { bestSize } from '$lib/utils/auxd';
	import { first } from '$lib/utils/xl';
	import { Width } from '$lib/types/auxd';
	import SearchCard from '$lib/components/find/SearchCard.svelte';

	const { data } = $props();

	const description = $derived(getMetaDescription(data.overview));
	const ogImage = $derived(
		data.images?.length ? bestSize(first(data.images), Width.MEDIUM)?.url : undefined
	);

	// TODO: Possibly figure out some mapping and set og:type,
	// see https://ogp.me/#types. Unclear how meaningful this would be.

	let previousURL: URL;
	const refinedLibraries = $derived(
		getLibraryIdsFromMapping([data.searchResult?.mapping, data.subsetMapping])
	);

	const holdingsParam = $derived(page.state.holdings || page.url.searchParams.get('holdings'));
	const modalCard = $derived(
		(holdingsParam &&
			data.instances.filter(
				(instance: { [JsonLd.ID]: string }) =>
					`${stripAnchor(trimSlashes(relativizeUrl(instance[JsonLd.ID])))}` === holdingsParam
			)[0]) ||
			data.workCard
	);

	afterNavigate(({ to }) => {
		if (to) {
			previousURL = to.url;
		}
	});

	function handleCloseModal(param: string) {
		if (!previousURL?.searchParams.has(param)) {
			history.back();
		} else {
			const newSearchParams = new SvelteURLSearchParams([
				...Array.from(page.url.searchParams.entries())
			]);
			newSearchParams.delete(param);
			goto(page.url.pathname + `?${newSearchParams.toString()}`, { replaceState: true });
		}
	}
</script>

<svelte:head>
	<title>{getPageTitle(data.title, page.data.siteName)}</title>
</svelte:head>

<Meta
	title={data.title}
	{description}
	image={ogImage}
	url={page.url.origin + page.url.pathname}
	siteName={getPageTitle(undefined, page.data.siteName)}
/>

<div data-testid="resource-page" class="contents">
	<!-- Zotero tag -->
	{#if data.instances?.length}
		<abbr class="unapi-id hidden" title={data.uri}></abbr>
	{/if}
	<Resource
		fnurgel={page.params.fnurgel}
		uri={data.uri}
		recordUri={data.recordUri}
		controlNumber={data.controlNumber}
		type={data.type}
		typeForIcon={data.typeForIcon}
		images={data.images}
		decoratedData={data.decoratedData}
		relations={data.relations}
		relationsPreviewsByQualifierKey={data.relationsPreviewsByQualifierKey}
		instances={data.instances}
		holdings={data.holdings}
		searchResult={data.searchResult}
		tableOfContents={data.tableOfContents}
		adjecentSearchResults={page.state.adjecentSearchResults}
	/>
	{#if holdingsParam}
		<Modal close={() => handleCloseModal('holdings')}>
			{#snippet title()}
				<span>{page.data.t('holdings.findAtYourNearestLibrary')}</span>
			{/snippet}
			<HoldingsContent holdings={data.holdings} {refinedLibraries} libOrgs={data.refinedOrgs}>
				{#snippet card()}
					<SearchCard item={modalCard} />
				{/snippet}
			</HoldingsContent>
		</Modal>
	{:else if page.state.citations || page.url.searchParams.get('cite')}
		<Modal close={() => handleCloseModal('cite')}>
			{#snippet title()}
				<span>{page.data.t('citations.cite')} {data.title}</span>
			{/snippet}
			<Citations
				citations={(page.state.citations || page.data.citations) as Promise<CitationsType>}
				id={page.state.citationId || page.url.searchParams.get('cite')}
			/>
		</Modal>
	{/if}
</div>
