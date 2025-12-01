<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import type { BibIdData, HolderLinks, HoldingLinks, LibraryWithLinks } from '$lib/types/holdings';
	import LoanStatus from './LoanStatus.svelte';
	import BiChevronRight from '~icons/bi/chevron-right';
	import { createHoldingLinks } from '$lib/utils/holdings';

	type Props = {
		holder: LibraryWithLinks;
		instances: BibIdData;
		hidden?: boolean;
	};
	const { holder, instances, hidden = false }: Props = $props();
	const holderLinks: HolderLinks = $state(holder._links);

	let holdingLinks: Record<string, HoldingLinks> = $state({});
	for (const [key, bibIdObj] of Object.entries(instances)) {
		holdingLinks[key] = createHoldingLinks(bibIdObj, holder, page.data.locale);
	}

	// load data when in viewport
	let root: Element;
	let observer: IntersectionObserver;

	// let loading = $state(false);
	let error = $state(!holder);

	onMount(() => {
		if (browser) {
			observer = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						// loadHolder();
						observer?.disconnect();
					}
				});
			});
			observer.observe(root);
		}
	});

	onDestroy(() => {
		observer?.disconnect();
	});

	// async function loadHolder() {
	// 	loading = true;
	// 	const holderId: string = holder.obj?.['@id'] || '';
	// 	try {
	// 		const res = await fetch(`/api/${page.data.locale}/holder?id=${holderId}`);
	// 		if (res.ok) {
	// 			type HolderResponse = { links: HolderLinks; libraryMainEntity: FramedData };
	// 			const { links, libraryMainEntity }: HolderResponse = await res.json();
	// 			holderLinks = links;

	// 			// create holder-specific links for its held instances
	// 			let tempHoldingLinks: Record<string, HoldingLinks> = {};
	// 			for (const [key, bibIdObj] of Object.entries(instances)) {
	// 				tempHoldingLinks[key] = createHoldingLinks(bibIdObj, libraryMainEntity, page.data.locale);
	// 			}
	// 			holdingLinks = tempHoldingLinks;
	// 			loading = false;
	// 		} else {
	// 			error = true;
	// 			loading = false;
	// 		}
	// 	} catch (e) {
	// 		console.error(e);
	// 		loading = false;
	// 		error = true;
	// 	}
	// }

	const hasSomeItemLink = $derived(
		holdingLinks
			? Object.values(holdingLinks).some(
					(item) =>
						item.linksToItem.length || item.loanReserveLink.length || item.itemStatus?.length
				)
			: false
	);

	const hasEveryItemLink = $derived(
		holdingLinks
			? Object.values(holdingLinks).every(
					(item) => item.linksToItem.length || item.loanReserveLink.length
				)
			: false
	);

	const hasOpeningHoursEtc = $derived(
		holderLinks && !!(holderLinks.openingHours?.join('') + holderLinks.address?.join('').trim())
	);

	const INSTANCE_LIMIT = 5;
	let currentInstanceLimit = $state(INSTANCE_LIMIT);
	const totalNumInstances = $derived(Object.keys(holdingLinks || {}).length);
	const shownInstances = $derived(
		Object.entries(holdingLinks || {}).filter((item, index) => index < currentInstanceLimit)
	);

	const instancesCanExpand = $derived(currentInstanceLimit < totalNumInstances);
	const instancesCanCollapse = $derived(currentInstanceLimit > INSTANCE_LIMIT);
</script>

<li
	class={['border-neutral flex flex-col gap-2 pb-3 not-last:border-b', hidden && 'hidden']}
	bind:this={root}
>
	<h3 class="text-sm font-medium">{holder.name}</h3>
	<!-- {#if loading}
		<p class="animate-pulse">{page.data.t('search.loading')}</p>
	{/if} -->
	{#if error}
		<div class="text-error bg-severe-50 rounded-sm p-2">
			<p>{page.data.t('errors.somethingWentWrong')}</p>
		</div>
	{/if}
	{#if holderLinks}
		<ul class="flex flex-col gap-2 [&>li]:flex [&>li]:flex-col [&>li]:items-start">
			{#if hasSomeItemLink}
				<!-- instance-specific links -->
				<!-- loan reserve link OR item link AND loan status  -->
				{#each shownInstances as [key, holding] (key)}
					{@const manyInstances = Object.keys(holdingLinks || {}).length > 1}
					<li class={['flex flex-col', manyInstances ? 'instance-one-of-many gap-1' : 'gap-2']}>
						{#if manyInstances}
							<h4 class="text-subtle font-medium">{holding.str || '-'}</h4>
						{/if}
						{#if holding.loanReserveLink?.[0]}
							<a
								href={holding.loanReserveLink[0]}
								target="_blank"
								class="holder-cta-btn ext-link btn btn-cta mb-1"
							>
								{page.data.t('holdings.loanReserveLink')}
							</a>
						{:else if holding.linksToItem?.[0]}
							<a href={holding.linksToItem[0]} target="_blank" class="ext-link">
								{page.data.t('holdings.linkToLocal')}
							</a>
						{/if}
						{#if holding.itemStatus?.[0]}
							{@const bibIdObj = instances[key]}
							{#if bibIdObj}
								<LoanStatus sigel={holder.sigel} {bibIdObj} />
							{/if}
						{/if}
					</li>
				{/each}
				<!-- show more/less button -->
				{#if instancesCanExpand}
					<li class="mb-2">
						<button
							class="link-subtle text-xs"
							onclick={() => (currentInstanceLimit = totalNumInstances)}
						>
							{page.data.t('holdings.showAll')} ({totalNumInstances})
						</button>
					</li>
				{:else if instancesCanCollapse}
					<li class="mb-2">
						<button
							class="link-subtle text-xs"
							onclick={() => (currentInstanceLimit = INSTANCE_LIMIT)}
						>
							{page.data.t('holdings.showFewer')}
						</button>
					</li>
				{/if}
			{/if}
			<!-- Lopac general links -->
			{#if holderLinks.myLoansLink || holderLinks.registrationLink}
				<li>
					<div class="flex flex-row gap-2">
						{#if holderLinks.myLoansLink}
							<a target="_blank" class="ext-link" href={holderLinks.myLoansLink}>
								{page.data.t('holdings.myLoans')}
							</a>
						{/if}
						{#if holderLinks.registrationLink}
							<a target="_blank" class="ext-link" href={holderLinks.registrationLink}>
								{page.data.t('holdings.applyForCard')}
							</a>
						{/if}
					</div>
				</li>
			{/if}
			{#if !hasEveryItemLink}
				<!-- general holder links -->
				{#if holderLinks.linksToCatalog.length}
					{#each holderLinks.linksToCatalog as linkToCatalog, i (i)}
						<li>
							<a href={linkToCatalog} target="_blank" class="ext-link">
								{page.data.t('holdings.linkToCatalog')}
							</a>
						</li>
					{/each}
				{:else if holderLinks.linksToSite.length}
					{#each holderLinks.linksToSite as linkToSite, i (i)}
						<li>
							<a href={linkToSite} target="_blank" class="ext-link">
								{page.data.t('holdings.linkToSite')}
							</a>
						</li>
					{/each}
				{/if}
			{/if}
			{#if hasOpeningHoursEtc}
				<li>
					<!-- opening hours / adress -->
					<details class="w-full">
						<summary class="link-subtle flex cursor-pointer items-center gap-0.5">
							<span
								class="text-3xs arrow text-subtle h-3 origin-center rotate-0 transition-transform"
							>
								<BiChevronRight />
							</span>
							<span>{page.data.t('holdings.openingHoursEtc')}</span>
						</summary>
						<div class="border-neutral bg-page mt-2 max-w-md rounded-sm border p-2">
							<ul class="whitespace-pre-line">
								{#each holderLinks.openingHours as openingHours, i (i)}
									<li>{openingHours}</li>
								{/each}
								{#each holderLinks.address as address, i (i)}
									<li>{address}</li>
								{/each}
							</ul>
						</div>
					</details>
				</li>
			{/if}
		</ul>
	{/if}
</li>

<style>
	details[open] {
		& .arrow {
			rotate: 90deg;
		}
	}

	.instance-one-of-many {
		margin-bottom: calc(var(--spacing) * 2);
		border-left: 2px solid var(--color-neutral-300);
		padding-left: calc(var(--spacing) * 2);
	}

	.holder-cta-btn {
		color: var(--color-white);
		text-decoration: none;
		height: auto;
		padding: calc(var(--spacing) * 1.5) calc(var(--spacing) * 2);
		border-radius: var(--spacing);

		&::after {
			background-color: var(--color-white);
		}
	}
</style>
