<script lang="ts">
	import { page } from '$app/state';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import type { LibraryWithLinksAndInstances, OrgId, UnknownLibrary } from '$lib/types/holdings';
	import { JsonLd } from '$lib/types/xl';
	import { getMyLibsFromHoldings, isLibraryOrg } from '$lib/utils/holdings';
	import Holder from './Holder.svelte';
	import BiSearch from '~icons/bi/search';
	// import BiHouseHeart from '~icons/bi/house-heart';
	import IconChevron from '~icons/bi/chevron-down';
	import BiBank from '~icons/bi/bank';
	import { getLibraryIdsFromMapping } from '$lib/utils/getLibraryIdsFromMapping';

	type Props = {
		holders: (LibraryWithLinksAndInstances | UnknownLibrary)[];
		searchPhrase: string;
	};

	let { holders, searchPhrase = $bindable() }: Props = $props();

	type OrgWithMembers = {
		[JsonLd.ID]: string;
		_orgLabel: string;
		_members: LibraryWithLinksAndInstances[];
	};

	type NestedLibraries = LibraryWithLinksAndInstances | OrgWithMembers | UnknownLibrary;

	const libOrgs: Record<OrgId, string[]> = page.data.refinedOrgs;
	const { myLibraries } = getUserSettings();
	const numHolders = $derived(holders?.length);

	const filteredHolders = $derived(
		holders.filter((holder) => {
			if (searchPhrase && !holder.name) return false;
			return holder.name.toLowerCase().indexOf(searchPhrase.toLowerCase()) > -1;
		})
	);

	const myLibsHolders = $derived.by(() => {
		if (!myLibraries) return [];
		const holderIds = holders.map((holder) => holder[JsonLd.ID]);
		const ids = getMyLibsFromHoldings(myLibraries, holderIds, libOrgs);
		return buildNestedLibraries(ids, myLibraries, holders);
	});

	const refinedHolders = $derived.by(() => {
		const refinedLibraries = getLibraryIdsFromMapping([
			page.data.searchResult?.mapping,
			page.data.subsetMapping
		]);
		if (!refinedLibraries) return [];
		const ids = Object.keys(refinedLibraries);
		return buildNestedLibraries(ids, refinedLibraries, holders);
	});

	function buildNestedLibraries(
		ids: string[] | null | undefined,
		labelMap: Record<string, string> | undefined,
		holders: (LibraryWithLinksAndInstances | UnknownLibrary)[]
	): NestedLibraries[] {
		if (!ids || !labelMap) return [];

		const result: NestedLibraries[] = [];

		for (const id of ids) {
			if (isLibraryOrg(id)) {
				const memberIds = libOrgs?.[id];

				if (!memberIds) {
					console.warn('Failed to lookup holding org', id);
					continue;
				}

				const members = memberIds
					.map((memberId) => holders.find((h) => h[JsonLd.ID] === memberId))
					.filter(Boolean) as NestedLibraries[];

				if (members.length) {
					result.push({
						[JsonLd.ID]: id,
						_orgLabel: labelMap[id],
						_members: members
					} as OrgWithMembers);
				}
				continue;
			}

			const found = holders.find((h) => h[JsonLd.ID] === id);
			if (found) result.push(found);
		}

		return result;
	}

	const specialSections = $derived([
		{
			id: 'refined-libraries-section',
			title: page.data.t(`holdings.refinedLibraries`),
			data: refinedHolders
			// icon: BiSearch
		},
		{
			id: 'my-libraries-section',
			title: page.data.t('myPages.favouriteLibraries'),
			data: myLibsHolders
			// icon: BiHouseHeart
		}
	]);
</script>

<!-- num libraries -->
{#if numHolders}
	<h2 class="my-2">
		{page.data.t('holdings.availableAt')}
		{numHolders}
		{numHolders === 1 ? page.data.t('holdings.library') : page.data.t('holdings.libraries')}
	</h2>
{/if}
<!-- refined libraries & my libraries -->
{#each specialSections as section (section.id)}
	{#if section.data.length}
		<!-- {@const Icon = section.icon} -->
		<details
			open
			class="special-section border-neutral bg-page mb-2 flex flex-col rounded-sm border p-4"
		>
			<summary class="cursor-pointer">
				<h2 class="flex items-center gap-2">
					<!-- <Icon /> -->
					<span
						class="arrow text-subtle origin-center text-base transition-transform"
						aria-hidden="true"
					>
						<IconChevron />
					</span>
					<span class="font-medium">{section.title}</span>
				</h2>
			</summary>
			<ul class="mt-3 flex flex-col gap-2 text-xs">
				{#each section.data as holder, i (`mylibs-${holder[JsonLd.ID]}-${i}`)}
					{#if '_members' in holder}
						<li>
							<h3 class="mb-3 flex items-center gap-2">
								<span aria-hidden="true" class="text-subtle text-base">
									<BiBank class="text-subtle size-3" />
								</span>
								<span>{holder._orgLabel}</span>
							</h3>
							<ul class="flex flex-col gap-2">
								{#each holder._members as member (`mylibs-member${member[JsonLd.ID]}`)}
									<Holder holder={member} />
								{/each}
							</ul>
						</li>
					{:else}
						<Holder {holder} />
					{/if}
				{/each}
			</ul>
		</details>
	{/if}
{/each}
<!-- search -->
<div class="relative">
	<input
		bind:value={searchPhrase}
		placeholder={`${page.data.t('search.search')} ${page.data.t('holdings.library')}`}
		aria-label={page.data.t('holdings.findLibrary')}
		class="bg-input h-9 w-full rounded-sm border border-neutral-300 pr-2 pl-8 text-xs"
		type="search"
		name={page.data.t('holdings.findLibrary')}
	/>
	<BiSearch class="text-subtle absolute top-0 left-2.5 h-9" />
</div>
<!-- list holders -->
<ul class="flex flex-col gap-2 text-xs">
	{#each holders as holder, i (`${holder[JsonLd.ID]}-${i}`)}
		<Holder {holder} hidden={!filteredHolders.find((h) => h[JsonLd.ID] === holder[JsonLd.ID])} />
	{/each}
	{#if filteredHolders.length === 0}
		<li>
			<span role="alert">{page.data.t('search.noResults')}</span>
		</li>
	{/if}
</ul>

<style>
	:global(.special-section .holder) {
		padding: 0;
		padding-bottom: calc(var(--spacing) * 3);
		padding-top: calc(var(--spacing) * 3);
		border-radius: 0;
		border-bottom: none;
		border-top: 1px solid var(--color-neutral-200);
	}

	details[open] {
		& .arrow {
			rotate: 180deg;
		}
	}
</style>
