<script lang="ts">
	import { page } from '$app/state';
	import { getSelectionContext, type ReviewItem } from '#lib/contexts/selection.svelte.ts';
	import { getUserSettings } from '#lib/contexts/userSettings.ts';
	import type { AvailableCitationFormat, CitationData } from '#lib/types/citation.ts';
	import { getAvailableFormats } from '#lib/utils/citation.ts';
	import BiChevronDown from '~icons/bi/chevron-down';
	import Citation from './Citation.svelte';
	import IconChevron from '~icons/bi/chevron-down';

	const userSettings = getUserSettings();
	const selection = getSelectionContext();
	const availableCitationFormats = getAvailableFormats();

	let selectedFormat = $derived(availableCitationFormats.find((f) => f.key === selection.format));
	const citation = $derived(selection.citation);
	const citationData: CitationData = $derived({ ...selectedFormat, citation });
	const reviewItems = $derived(selection.forReview);

	function handleChangeFormat(event: Event) {
		const format = (event.currentTarget as HTMLSelectElement).value as AvailableCitationFormat;

		userSettings.saveSelectedCitationFormat(format);
	}
</script>

{#snippet checkbox(item: ReviewItem)}
	{const checked = $derived(selection.isSelected(item.id))}
	<input
		type="checkbox"
		id={`checkbox-${item.id}`}
		{checked}
		onchange={() => selection.toggle(item.id)}
	/>
	<label for={`checkbox-${item.id}`}>{item.str}</label>
{/snippet}

<div class="text-sm">
	<div class="flex items-center justify-between gap-4">
		<p role="status" aria-atomic="true" class="font-medium">
			{selection.length} valda saker
		</p>
		<button class="btn btn-primary" onclick={() => selection.clear()}> Rensa </button>
	</div>

	<div class="mt-4 pt-4 flex flex-col gap-2 border-t border-t-neutral-200">
		{#if reviewItems.length}
			<div class="text-xs bg-severe-50 p-2">
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
							utgåvor. Dessa saknar utgivningsår och förlag, vilket leder till ofullständiga referenser.
							Nedan kan du granska detta och välja en enskild utgåva istället.
						</p>
					</div>
					{#each reviewItems as item (item.id)}
						<details class="mt-2">
							<summary>
								{@render checkbox(item)}
							</summary>
							<ul class="ml-2 mt-1">
								{#each item.instances as instance (instance.id)}
									<li>{@render checkbox(instance)}</li>
								{/each}
							</ul>
						</details>
					{/each}
				</details>
			</div>
		{/if}
		<fieldset class="flex items-center gap-2">
			<legend class="mb-2">Skapa referenser av ditt urval</legend>

			<label for="citation-format-select" class="sr-only">
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
		</fieldset>

		{#if selection.length > 0}
			<Citation citation={citationData} loading={selection.loading} />
		{/if}
	</div>
</div>
