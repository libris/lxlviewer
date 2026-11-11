<script lang="ts">
	import { page } from '$app/state';
	import { JsonLd } from '#lib/types/xl.ts';
	import { getSelectionContext, type ReviewItem } from '#lib/contexts/selection.svelte.ts';
	import { getUserSettings } from '#lib/contexts/userSettings.ts';
	import type { AvailableCitationFormat, CitationData } from '#lib/types/citation.ts';
	import { getAvailableFormats } from '#lib/utils/citation.ts';
	import BiChevronDown from '~icons/bi/chevron-down';
	import Citation from './Citation.svelte';
	import TabList, { type Tab } from './TabList.svelte';
	import SearchCard from './find/SearchCard.svelte';
	import IconChevron from '~icons/bi/chevron-down';
	import BiTrash from '~icons/bi/trash';

	const userSettings = getUserSettings();
	const selection = getSelectionContext();
	const availableCitationFormats = getAvailableFormats();

	let selectedFormat = $derived(availableCitationFormats.find((f) => f.key === selection.format));
	const citation = $derived(selection.citation);
	const citationData: CitationData = $derived({ ...selectedFormat, citation });
	const reviewItems = $derived(selection.forReview);
	const loading = $derived(selection.loading);

	const tabs: Tab[] = [
		{
			label: 'Skapa referenser',
			id: 'references',
			content: createReferences
		},
		{
			label: 'Redigera urval',
			id: 'edit-selection',
			content: editSelection
		}
	];

	function handleChangeFormat(event: Event) {
		const format = (event.currentTarget as HTMLSelectElement).value as AvailableCitationFormat;
		userSettings.saveSelectedCitationFormat(format);
	}
</script>

{#snippet checkbox(item: ReviewItem)}
	{const checked = $derived(selection.isSelected(item.id))}
	<input
		class="mr-1"
		type="checkbox"
		id={`checkbox-${item.id}`}
		{checked}
		onchange={() => selection.toggle(item.id)}
	/>
	<label for={`checkbox-${item.id}`}>{item.str}</label>
{/snippet}

{#snippet skeleton()}
	<div class="flex p-2 flex-col gap-2 overflow-hidden">
		{#each new Array(5)}
			<div class="skeleton bg-neutral min-h-2 w-full"></div>
			<div class="skeleton bg-neutral min-h-2 w-3/4"></div>
			<div class="skeleton bg-neutral mb-2 min-h-2 w-5/6"></div>
		{/each}
	</div>
{/snippet}

{#snippet createReferences()}
	<div class="py-4 flex flex-col gap-2" aria-busy={loading}>
		{#if reviewItems.length}
			<div class="text-xs bg-severe-50 p-2 mb-2">
				<details>
					<summary class="flex items-center cursor-pointer font-medium">
						<span class="badge badge-warning mr-2">{reviewItems.length}</span>
						<span>Urvalet kan behöva granskas</span>
						<span aria-hidden="true" class="transition-transform ml-auto">
							<IconChevron class="text-subtle size-3.5" />
						</span>
					</summary>
					<div class="my-2">
						<p class="mt-1">
							Ditt urval innehåller <span class="font-medium">{reviewItems.length}</span> verk med flera
							utgåvor. Verk saknar utgivningsår och förlag, vilket leder till ofullständiga referenser.
							Nedan kan du granska och välja en enskild utgåva istället.
						</p>
					</div>
					{#each reviewItems as item (item.id)}
						<details class="open:mb-2 open:[&>summary]:bg-severe-100">
							<summary
								class="flex items-baseline p-2 cursor-pointer font-medium transition-colors bg-severe-50 hover:bg-severe-100"
							>
								{'•'}
								{item.str}
								<span aria-hidden="true" class="transition-transform ml-auto">
									<IconChevron class="text-subtle size-3.5" />
								</span>
							</summary>
							<ul class="mt-2 flex flex-col">
								<li class="ml-1 py-1">{@render checkbox(item)}</li>
								{#each item.instances as instance (instance.id)}
									<li class="ml-2 pl-2 py-1 border-l border-l-severe-100">
										{@render checkbox(instance)}
									</li>
								{/each}
							</ul>
						</details>
					{/each}
				</details>
			</div>
		{/if}

		<div>
			<label for="citation-format-select" class="pb-2 block">
				{page.data.t('citations.selectFormat')}:
			</label>
			<div class="relative w-min">
				<select
					class="btn btn-primary appearance-none pr-8"
					bind:value={selection.format}
					id="citation-format-select"
					onchange={handleChangeFormat}
				>
					{#each availableCitationFormats as format (format.key)}
						<option value={format.key}>{format.name}</option>
					{/each}
				</select>

				<span class="text-subtle pointer-events-none absolute top-0 right-1.5 py-2.5 text-xs">
					<BiChevronDown aria-hidden="true" />
				</span>
			</div>
		</div>
		{#if loading}
			{@render skeleton()}
		{:else if selection.length > 0}
			<Citation citation={citationData} />
		{/if}
	</div>
{/snippet}

{#snippet editSelection()}
	<div class="py-4 flex flex-col gap-1" aria-busy={loading}>
		<button class="btn btn-primary self-start mb-2" onclick={() => selection.clear()}>
			<BiTrash aria-hidden="true" />
			Rensa urval
		</button>
		{#if loading}
			{@render skeleton()}
		{:else if selection.cards.length}
			<ol>
				{#each selection.cards as item, index (item[JsonLd.ID] + index)}
					<li class="border-b border-b-neutral-200">
						<SearchCard {item} selectable={true} allowActions={false} itemNo={index + 1} />
					</li>
				{/each}
			</ol>
		{/if}
	</div>
{/snippet}

<div class="text-sm">
	{#if selection?.limitReached}
		<details class="text-xs bg-severe-50 p-2 my-2 mb-2">
			<summary class="flex cursor-pointer">
				<span class="font-medium">Du har nått maxgränsen för ditt urval</span>
				<IconChevron class="ml-auto text-subtle size-3.5" />
			</summary>
			<p class="mt-2">
				Ditt urval har nått maxgränsen på {selection.limit} och inget mer kan läggas till. Du kan ta
				bort valda poster under fliken "Redigera urval".
			</p>
		</details>
	{/if}
	{#if selection?.error}
		<p role="status" class="p-2 bg-severe-50 my-2">
			{selection.error}
		</p>
	{/if}
	<TabList ariaLabel="hantera urval" {tabs} />
</div>
