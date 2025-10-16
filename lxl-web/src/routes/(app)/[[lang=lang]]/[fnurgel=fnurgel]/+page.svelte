<script lang="ts">
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { afterNavigate, goto } from '$app/navigation';
	import getPageTitle from '$lib/utils/getPageTitle';
	import { type CitationsType } from '$lib/types/citation.js';
	import type { HoldingsData } from '$lib/types/holdings.js';
	import Resource from '$lib/components/Resource.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Citations from '$lib/components/Citations.svelte';
	import HoldingsContent from '$lib/components/HoldingsContent.svelte';

	const { data } = $props();
	const holdings: HoldingsData = $derived({
		...data.holdings,
		instances: data.instances,
		overview: data.overview,
		title: data.title
	});

	let previousURL: URL;

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
	<title>{getPageTitle(data.title)}</title>
</svelte:head>
<div data-testid="resource-page" class="contents">
	<!-- Zotero tag -->
	{#if data.instances.length}
		<abbr class="unapi-id hidden" title={data.uri}></abbr>
	{/if}
	<Resource
		fnurgel={page.params.fnurgel}
		type={data.type}
		typeForIcon={data.typeForIcon}
		images={data.images}
		decoratedTypes={data.types}
		decoratedHeading={data.heading}
		decoratedOverview={data.overview}
		relations={data.relations}
		relationsPreviewsByQualifierKey={data.relationsPreviewsByQualifierKey}
		instances={data.instances}
		holdersByType={data.holdings.holdersByType}
		tableOfContents={data.tableOfContents}
		adjecentSearchResults={page.state.adjecentSearchResults}
	/>
	{#if page.state.holdings || page.url.searchParams.get('holdings')}
		<Modal close={() => handleCloseModal('holdings')}>
			{#snippet title()}
				<span>{page.data.t('holdings.findAtYourNearestLibrary')}</span>
			{/snippet}
			<HoldingsContent {holdings} />
		</Modal>
	{:else if page.state.citations || page.url.searchParams.get('cite')}
		<Modal close={() => handleCloseModal('cite')}>
			{#snippet title()}
				<span>{page.data.t('citations.createCitation')}</span>
			{/snippet}
			<Citations
				citations={(page.state.citations || page.data.citations) as Promise<CitationsType>}
				id={page.state.citationId || page.url.searchParams.get('cite')}
			/>
		</Modal>
	{/if}
</div>
