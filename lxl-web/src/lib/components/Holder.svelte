<script lang="ts">
	import { page } from '$app/state';
	import type {
		BibIdObj,
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

	type InstanceWithLinks = HoldingLinks & BibIdObj;

	const { holder, hidden = false }: Props = $props();
	let expanded = $state(false);

	const instances: InstanceWithLinks[] = $derived.by(() => {
		return isLibraryWithLinks(holder)
			? Object.values(holder._instances).map((instance) => {
					return {
						...instance,
						...createHoldingLinks(instance, holder, page.data.locale)
					};
				})
			: [];
	});

	const numInstances = $derived(instances.length);

	const DEFAULT_INSTANCE_LIMIT = 5;
	let instanceLimit = $state(DEFAULT_INSTANCE_LIMIT);
	const shownInstances = $derived(instances.filter((instance, index) => index < instanceLimit));
	const instancesCanExpand = $derived(numInstances > instanceLimit);
	const instancesCanCollapse = $derived(shownInstances.length > DEFAULT_INSTANCE_LIMIT);

	const hasOpeningHoursEtc = $derived(
		'_links' in holder &&
			!!(holder._links.openingHours?.join('') + holder._links.address?.join('').trim())
	);

	const hasSomeItemLink = $derived(
		instances.some(
			(instance) =>
				instance?.linksToItem.length ||
				instance?.loanReserveLink.length ||
				instance?.itemStatus?.length
		)
	);

	function isLibraryWithLinks(
		holder: LibraryWithLinks | UnknownLibrary
	): holder is LibraryWithLinks {
		return '_links' in holder && 'sigel' in holder;
	}

	function getBestLink(instance: InstanceWithLinks): string | undefined {
		let link: string | undefined;
		link = instance?.loanReserveLink?.[0] || instance?.linksToItem?.[0];
		if (link) return link;
		else if (isLibraryWithLinks(holder)) {
			return holder._links?.linksToCatalog?.[0] || holder._links?.linksToSite?.[0];
		}
		return link;
	}
</script>

<li
	class={[
		'holder border-neutral bg-page flex flex-col rounded-sm border-b p-3',
		hidden && 'hidden'
	]}
>
	<div class="holder-heading flex items-baseline justify-between">
		<h3 class="text-sm font-medium">{holder.displayStr || holder.name || holder[JsonLd.ID]}</h3>
		<!-- ext link or expand instances -->
		{#if (numInstances === 1 || !hasSomeItemLink) && getBestLink(instances[0])}
			<a
				href={getBestLink(instances[0])}
				target="_blank"
				aria-label={page.data.t('holdings.findAtLibrary')}
			>
				<BiBoxArrowUpRight class="text-link ml-2 size-4" />
			</a>
		{:else if numInstances > 1 && hasSomeItemLink}
			<button
				class="text-link ml-2 whitespace-nowrap"
				type="button"
				onclick={() => (expanded = !expanded)}
			>
				{page.data.t('holdings.chooseEdition')}
				({numInstances})</button
			>
		{/if}
	</div>
	{#if !isLibraryWithLinks(holder)}
		<div class="text-severe-600 bg-severe-50 mt-2 rounded-sm p-2">
			<p>{page.data.t('errors.notAvailable')}</p>
		</div>
	{:else}
		<ul class="flex flex-col [&>li]:flex [&>li]:flex-col [&>li]:items-start">
			{#if numInstances > 1 && expanded}
				<!-- multiple instances list -->
				{#each shownInstances as instance (instance.bibId)}
					<li class="instance-one-of-many gap-1">
						<h4 class="text-subtle font-medium">{instance.str || '-'}</h4>
						<!-- instance best link -->
						<a href={getBestLink(instance)} target="_blank" class="ext-link">
							{page.data.t('holdings.linkToLocal')}
						</a>
						{#if instance.itemStatus?.[0]}
							<LoanStatus sigel={holder.sigel} bibIdObj={instance} />
						{/if}
					</li>
				{/each}
				<!-- show more/less button -->
				{#if instancesCanExpand}
					<li class="mb-2">
						<button class="link-subtle text-xs" onclick={() => (instanceLimit = numInstances)}>
							{page.data.t('holdings.showAll')} ({numInstances})
						</button>
					</li>
				{:else if instancesCanCollapse}
					<li class="mb-2">
						<button
							class="link-subtle text-xs"
							onclick={() => (instanceLimit = DEFAULT_INSTANCE_LIMIT)}
						>
							{page.data.t('holdings.showFewer')}
						</button>
					</li>
				{/if}
			{/if}
			<!-- loan status for single instance -->
			{#if numInstances === 1 && instances[0].itemStatus?.[0]}
				{@const singleInstance = instances[0]}
				<li class="mt-1">
					<LoanStatus sigel={holder.sigel} bibIdObj={singleInstance} />
				</li>
			{/if}
			<!-- Lopac general links -->
			{#if holder._links.myLoansLink || holder._links.registrationLink}
				<li class="mt-1">
					<div class="ml-4 flex flex-row gap-2">
						{#if holder._links.myLoansLink}
							<a target="_blank" class="ext-link" href={holder._links.myLoansLink}>
								{page.data.t('holdings.myLoans')}
							</a>
						{/if}
						{#if holder._links.registrationLink}
							<a target="_blank" class="ext-link" href={holder._links.registrationLink}>
								{page.data.t('holdings.applyForCard')}
							</a>
						{/if}
					</div>
				</li>
			{/if}
			<!-- opening hours / adress -->
			{#if hasOpeningHoursEtc}
				<li class="mt-1">
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
								{#each holder._links.openingHours as openingHours, i (i)}
									<li>{openingHours}</li>
								{/each}
								{#each holder._links.address as address, i (i)}
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
