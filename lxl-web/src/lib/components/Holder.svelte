<script lang="ts">
	import { page } from '$app/state';
	import type {
		HolderLinks,
		HoldingLinks,
		LibraryWithLinks,
		LibraryWithLinksAndInstances,
		UnknownLibrary
	} from '$lib/types/holdings';
	import { JsonLd } from '$lib/types/xl';
	import BiChevronDown from '~icons/bi/chevron-down';
	import { createHoldingLinks } from '$lib/utils/holdings';
	import LoanStatus from './LoanStatus.svelte';

	type Props = {
		holder: LibraryWithLinksAndInstances | UnknownLibrary;
		hidden?: boolean;
	};

	function isLibraryWithLinks(
		holder: LibraryWithLinks | UnknownLibrary
	): holder is LibraryWithLinks {
		return '_links' in holder && 'sigel' in holder;
	}

	const { holder, hidden = false }: Props = $props();

	const holderLinks: HolderLinks | undefined = $state(
		isLibraryWithLinks(holder) ? holder._links : undefined
	);

	let holdingLinks: Record<string, HoldingLinks> = $state({});
	if (isLibraryWithLinks(holder)) {
		for (const [key, bibIdObj] of Object.entries(holder._instances)) {
			holdingLinks[key] = createHoldingLinks(bibIdObj, holder, page.data.locale);
		}
	}

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
	class={[
		'holder border-neutral bg-page flex flex-col gap-2 rounded-sm border-b p-3',
		hidden && 'hidden'
	]}
>
	<h3 class="text-sm font-medium">{holder.displayStr || holder.name || holder[JsonLd.ID]}</h3>
	{#if !isLibraryWithLinks(holder)}
		<div class="text-error bg-severe-50 rounded-sm p-2">
			<p>{page.data.t('errors.notAvailable')}</p>
		</div>
	{:else if holderLinks}
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
							{@const bibIdObj = holder?._instances?.[key]}
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
						<summary class="link-subtle flex cursor-pointer items-center gap-1">
							<span class="text-3xs arrow text-subtle flex h-3 origin-center rotate-0 items-center">
								<BiChevronDown />
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
			rotate: 180deg;
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
