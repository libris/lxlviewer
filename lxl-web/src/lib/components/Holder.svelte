<script lang="ts">
	import { page } from '$app/state';
	import type { BibIdByInstanceId, DecoratedHolder, HolderLinks } from '$lib/types/holdings';
	import BiChevronRight from '~icons/bi/chevron-right';
	import LoanStatus from './LoanStatus.svelte';

	type Props = {
		holderData: HolderLinks & DecoratedHolder;
		bibIds: BibIdByInstanceId;
	};
	const { holderData, bibIds }: Props = $props();

	const hasSomeItemLink = $derived(
		Object.values(holderData.bibIds || {}).some(
			(item) => item.linksToItem.length || item.loanReserveLink.length || item.itemStatus?.length
		)
	);

	const hasEveryItemLink = $derived(
		Object.values(holderData.bibIds || {}).every(
			(item) => item.linksToItem.length || item.loanReserveLink.length
		)
	);

	const hasOpeningHoursEtc = $derived(
		!!(holderData.openingHours?.join('') + holderData.address?.join('').trim())
	);

	const INSTANCE_LIMIT = 5;
	let currentInstanceLimit = $state(INSTANCE_LIMIT);
	const totalNumInstances = $derived(Object.keys(holderData?.bibIds || {}).length);
	const shownInstances = $derived(
		Object.entries(holderData?.bibIds || {}).filter((item, index) => index < currentInstanceLimit)
	);

	const instancesCanExpand = $derived(currentInstanceLimit < totalNumInstances);
	const instancesCanCollapse = $derived(currentInstanceLimit > INSTANCE_LIMIT);
</script>

<li class="border-neutral flex flex-col gap-2 pb-3 not-last:border-b">
	<h3 class="text-sm font-medium">{holderData.str}</h3>
	<ul class="flex flex-col gap-2 [&>li]:flex [&>li]:flex-col [&>li]:items-start">
		{#if hasSomeItemLink}
			<!-- instance-specific links -->
			<!-- loan reserve link OR item link AND loan status  -->
			{#each shownInstances as [key, bibId] (key)}
				{@const manyInstances = Object.keys(holderData.bibIds).length > 1}
				<li class={['flex flex-col', manyInstances ? 'instance-one-of-many gap-1' : 'gap-2']}>
					{#if manyInstances}
						<h4 class="text-subtle font-medium">{bibId.str || '-'}</h4>
					{/if}
					{#if bibId.loanReserveLink?.[0]}
						<a
							href={bibId.loanReserveLink[0]}
							target="_blank"
							class="holder-cta-btn ext-link btn btn-cta mb-1"
						>
							{page.data.t('holdings.loanReserveLink')}
						</a>
					{:else if bibId.linksToItem?.[0]}
						<a href={bibId.linksToItem[0]} target="_blank" class="ext-link">
							{page.data.t('holdings.linkToLocal')}
						</a>
					{/if}
					{#if bibId.itemStatus?.[0]}
						{@const bibIdObj = Object.values(bibIds).find((obj) => obj.bibId === key)}
						{#if bibIdObj}
							<LoanStatus sigel={holderData.sigel} {bibIdObj} />
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
		{#if holderData.myLoansLink || holderData.registrationLink}
			<li>
				<div class="flex flex-row gap-2">
					{#if holderData.myLoansLink}
						<a target="_blank" class="ext-link" href={holderData.myLoansLink}>
							{page.data.t('holdings.myLoans')}
						</a>
					{/if}
					{#if holderData.registrationLink}
						<a target="_blank" class="ext-link" href={holderData.registrationLink}>
							{page.data.t('holdings.applyForCard')}
						</a>
					{/if}
				</div>
			</li>
		{/if}
		{#if !hasEveryItemLink}
			<!-- general holder links -->
			{#if holderData.linksToCatalog.length}
				{#each holderData.linksToCatalog as linkToCatalog, i (i)}
					<li>
						<a href={linkToCatalog} target="_blank" class="ext-link">
							{page.data.t('holdings.linkToCatalog')}
						</a>
					</li>
				{/each}
			{:else if holderData.linksToSite.length}
				{#each holderData.linksToSite as linkToSite, i (i)}
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
							{#each holderData.openingHours as openingHours, i (i)}
								<li>{openingHours}</li>
							{/each}
							{#each holderData.address as address, i (i)}
								<li>{address}</li>
							{/each}
						</ul>
					</div>
				</details>
			</li>
		{/if}
	</ul>
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
