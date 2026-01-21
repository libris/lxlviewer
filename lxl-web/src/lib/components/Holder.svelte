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
	import BiChevronRight from '~icons/bi/chevron-right';
	import BiBoxArrowUpRight from '~icons/bi/box-arrow-up-right';
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
	let expanded = $state(false);

	const holderLinks: HolderLinks | undefined = $state(
		isLibraryWithLinks(holder) ? holder._links : undefined
	);

	const holdingLinks = $derived.by(() => {
		let _holdingLinks: Record<string, HoldingLinks> = {};
		if (isLibraryWithLinks(holder)) {
			for (const [key, bibIdObj] of Object.entries(holder._instances)) {
				_holdingLinks[key] = createHoldingLinks(bibIdObj, holder, page.data.locale);
			}
		}
		return _holdingLinks;
	});

	const manyInstances = $derived(Object.keys(holdingLinks || {}).length > 1);

	const hasSomeItemLink = $derived(
		holdingLinks
			? Object.values(holdingLinks).some(
					(item) =>
						item.linksToItem.length || item.loanReserveLink.length || item.itemStatus?.length
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

	const bestLink = $derived.by(() => {
		let link: string | undefined;
		if (totalNumInstances === 1 && holdingLinks) {
			const _links = Object.values(holdingLinks)[0];
			link = _links?.loanReserveLink?.[0] || _links?.linksToItem?.[0];
			if (link) return link;
			if (holderLinks) {
				link = holderLinks?.linksToCatalog?.[0] || holderLinks?.linksToSite?.[0];
				return link;
			}
		}
		if (manyInstances && !hasSomeItemLink) {
			link = holderLinks?.linksToCatalog?.[0] || holderLinks?.linksToSite?.[0];
			return link;
		}
		return link;
	});
</script>

<li
	class={[
		'holder border-neutral bg-page flex flex-col rounded-sm border-b p-3',
		hidden && 'hidden'
	]}
>
	<div class="holder-heading flex items-baseline justify-between">
		<h3 class="text-sm font-medium">{holder.displayStr || holder.name || holder[JsonLd.ID]}</h3>
		{#if bestLink}
			<a href={bestLink} target="_blank" aria-label={page.data.t('holdings.findAtLibrary')}>
				<BiBoxArrowUpRight class="text-link ml-2 size-4" />
			</a>
		{:else if manyInstances}
			<button
				class="text-link ml-2 whitespace-nowrap"
				type="button"
				onclick={() => (expanded = !expanded)}
			>
				{page.data.t('holdings.chooseEdition')}
				({totalNumInstances})</button
			>
		{/if}
	</div>
	{#if !isLibraryWithLinks(holder)}
		<div class="text-error bg-severe-50 rounded-sm p-2">
			<p>{page.data.t('errors.notAvailable')}</p>
		</div>
	{:else if holderLinks}
		<ul class="flex flex-col [&>li]:flex [&>li]:flex-col [&>li]:items-start">
			{#if manyInstances && expanded}
				<!-- instance-specific links -->
				<!-- loan reserve link OR item link AND loan status  -->
				{#each shownInstances as [key, holding] (key)}
					<li class={[manyInstances ? 'instance-one-of-many gap-1' : 'gap-2']}>
						{#if manyInstances}
							<h4 class="text-subtle font-medium">{holding.str || '-'}</h4>
						{/if}
						{#if holding.loanReserveLink?.[0]}
							<a href={holding.loanReserveLink[0]} target="_blank" class="ext-link">
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
			<!-- loan status for single instance -->
			{#if !manyInstances && holdingLinks}
				{#each shownInstances as [key, holding] (key)}
					{#if holding.itemStatus?.[0]}
						{@const bibIdObj = holder?._instances?.[key]}
						{#if bibIdObj}
							<li class="mt-1">
								<LoanStatus sigel={holder.sigel} {bibIdObj} />
							</li>
						{/if}
					{/if}
				{/each}
			{/if}
			<!-- Lopac general links -->
			{#if holderLinks.myLoansLink || holderLinks.registrationLink}
				<li class="mt-1">
					<div class="ml-4 flex flex-row gap-2">
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
			{#if hasOpeningHoursEtc}
				<li class="mt-1">
					<!-- opening hours / adress -->
					<details class="w-full">
						<summary class="link-subtle flex cursor-pointer items-center gap-1">
							<span
								class="text-3xs chevron text-subtle flex h-3 origin-center rotate-0 items-center transition-transform"
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
		& .chevron {
			rotate: 90deg;
		}
	}

	.instance-one-of-many {
		margin-top: calc(var(--spacing) * 2);
		margin-bottom: calc(var(--spacing) * 2);
		border-left: 2px solid var(--color-neutral-300);
		padding-left: calc(var(--spacing) * 2);
	}
</style>
