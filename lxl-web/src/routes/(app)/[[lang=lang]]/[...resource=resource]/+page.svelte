<script lang="ts">
	import { page } from '$app/state';
	import getPageTitle from '#lib/utils/getPageTitle.js';
	import getMetaDescription from '#lib/utils/getMetaDescription.js';
	import { JsonLd } from '#lib/types/xl.js';
	import { type CitationDataWithError } from '#lib/types/citation.js';
	import { getModalContext } from '#lib/contexts/modal.svelte.js';
	import { relativizeUrl, stripAnchor, trimSlashes } from '#lib/utils/http.js';
	import Resource from '#lib/components/Resource.svelte';
	import Modal from '#lib/components/Modal.svelte';
	import Meta from '#lib/components/Meta.svelte';
	import CiteOne from '#lib/components/CiteOne.svelte';
	import HoldingsContent from '#lib/components/HoldingsContent.svelte';
	import { bestSize } from '#lib/utils/auxd.js';
	import { Width } from '#lib/types/auxd.js';
	import SearchCard from '#lib/components/find/SearchCard.svelte';

	const { data } = $props();

	const description = $derived(getMetaDescription(data.decoratedData.overview?.[0]));
	const ogImage = $derived(data.image ? bestSize(data.image, Width.MEDIUM)?.url : undefined);
	const modal = getModalContext();

	// TODO: Possibly figure out some mapping and set og:type,
	// see https://ogp.me/#types. Unclear how meaningful this would be.

	const holdingsParam = $derived(page.state.holdingId || page.url.searchParams.get('holdings'));

	const modalCard = $derived.by(() => {
		const instances = data.instances ?? [];
		const matchingInstance = holdingsParam
			? instances.find(
					(instance: { [JsonLd.ID]: string }) =>
						stripAnchor(trimSlashes(relativizeUrl(instance[JsonLd.ID]))) === holdingsParam
				)
			: undefined;

		return matchingInstance ?? (data.isWork ? data.workCard : instances[0]);
	});
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
		{#each data.instances as instance (instance[JsonLd.ID])}
			<abbr class="unapi-id hidden" title={instance[JsonLd.ID]}></abbr>
		{/each}
	{/if}
	<Resource
		uri={data.uri}
		recordUri={data.recordUri}
		controlNumber={data.controlNumber}
		typeForIcon={data.typeForIcon}
		image={data.image}
		decoratedData={data.decoratedData}
		relations={data.relations}
		relationsPreviewsByQualifierKey={data.relationsPreviewsByQualifierKey}
		instances={data.instances}
		holdings={data.holdings}
		searchResult={data.searchResult}
		tableOfContents={data.tableOfContents}
		adjecentSearchResults={page.state.adjecentSearchResults}
		workCard={data.workCard}
		isWork={data.isWork}
	/>
	{#if holdingsParam}
		<Modal close={() => modal.onClose('holdings')}>
			{#snippet title()}
				<span>{page.data.t('holdings.findAtLibrary')}</span>
			{/snippet}
			<HoldingsContent holdings={data.holdings}>
				{#snippet card()}
					<SearchCard item={modalCard} headingIsLink={false} allowPopovers={false} />
				{/snippet}
			</HoldingsContent>
		</Modal>
	{:else if page.state.citations || page.url.searchParams.get('cite')}
		<Modal close={() => modal.onClose('cite')}>
			{#snippet title()}
				<span>{page.data.t('citations.cite')} {data.title}</span>
			{/snippet}
			<CiteOne
				citations={(page.state.citations || page.data.citations) as Promise<CitationDataWithError>}
				id={page.state.citationId || page.url.searchParams.get('cite')}
			/>
		</Modal>
	{/if}
</div>
