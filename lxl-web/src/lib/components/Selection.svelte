<script lang="ts">
	import { page } from '$app/state';
	import { getSelectionContext, type ReviewItem } from '#lib/contexts/selection.svelte.ts';
	import { getUserSettings } from '#lib/contexts/userSettings.ts';
	import type { AvailableCitationFormat, CitationData } from '#lib/types/citation.ts';
	import { getAvailableFormats } from '#lib/utils/citation.ts';
	import BiChevronDown from '~icons/bi/chevron-down';
	import Citation from './Citation.svelte';
	import IconChevron from '~icons/bi/chevron-down';
	import TabList, { type Tab } from './TabList.svelte';
	import SearchCard from './find/SearchCard.svelte';
	import { JsonLd } from '#lib/types/xl.ts';

	const userSettings = getUserSettings();
	const selection = getSelectionContext();
	const availableCitationFormats = getAvailableFormats();

	let selectedFormat = $derived(availableCitationFormats.find((f) => f.key === selection.format));
	const citation = $derived(selection.citation);
	const citationData: CitationData = $derived({ ...selectedFormat, citation });
	const reviewItems = $derived(selection.forReview);

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

{#snippet createReferences()}
	<div class="py-4 flex flex-col gap-2">
		{#if reviewItems.length}
			<div class="text-xs bg-severe-50 p-2 mb-2">
				<details>
					<summary class="flex items-center cursor-pointer font-medium">
						{'ⓘ '}
						Urvalet kan behöva granskas
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
						<details class="mt-2">
							<summary class="flex items-baseline cursor-pointer font-medium">
								{item.str}
								<span aria-hidden="true" class="transition-transform ml-auto">
									<IconChevron class="text-subtle size-3.5" />
								</span>
							</summary>
							<ul class="mt-2 flex flex-col gap-1">
								<li>{@render checkbox(item)}</li>
								{#each item.instances as instance (instance.id)}
									<li class="ml-1 pl-2 border-l border-l-severe-100">
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

		{#if selection.length > 0}
			<Citation citation={citationData} loading={selection.loading} />
		{/if}
	</div>
{/snippet}

{#snippet editSelection()}
	{$inspect(selection.cards)}
	<ol class="py-4 flex flex-col gap-1">
		{#each selection.cards as item, index (item[JsonLd.ID])}
			<li class="border-b border-b-neutral-200">
				<SearchCard {item} selectable={true} allowActions={false} itemNo={index + 1} />
			</li>
		{/each}
	</ol>
{/snippet}

<div class="text-sm">
	<div class="flex items-center justify-between gap-4">
		<p role="status" aria-atomic="true" class="font-medium">
			{selection.length} valda saker
		</p>
		<button class="btn btn-primary" onclick={() => selection.clear()}> Rensa urval </button>
	</div>

	<TabList ariaLabel="hantera urval" {tabs} />
</div>
