<script lang="ts">
	import { getUserSettings } from '#lib/contexts/userSettings.js';
	import type { AvailableCitationFormat, CitationDataWithError } from '#lib/types/citation.js';
	import { getAvailableFormats } from '#lib/utils/citation.js';
	import { fade } from 'svelte/transition';
	import { page } from '$app/state';
	import Spinner from './Spinner.svelte';
	import BiChevronDown from '~icons/bi/chevron-down';
	import Citation from './Citation.svelte';

	type Props = {
		citations: Promise<CitationDataWithError>;
		id: string | undefined | null;
	};

	let { citations, id }: Props = $props();
	const userSettings = getUserSettings();

	let selectedFormat = $state(userSettings?.selectedCitationFormat || 'all');

	function getDisplayedFormats(citations: CitationDataWithError) {
		return (
			citations.data &&
			citations.data.filter((format) =>
				selectedFormat === 'all' ? true : format.key === selectedFormat
			)
		);
	}

	function handleChangeFormat(e: Event): void {
		const target = e.target as HTMLSelectElement;
		userSettings.saveSelectedCitationFormat(target.value as AvailableCitationFormat);
	}
</script>

<div>
	<div class="relative w-min">
		<label for="citation-format-select" class="sr-only"
			>{page.data.t('citations.selectFormat')}</label
		>
		<select
			class="btn btn-primary appearance-none pr-8"
			bind:value={selectedFormat}
			id="citation-format-select"
			onchange={handleChangeFormat}
		>
			<option value="all">{page.data.t('citations.allFormats')}</option>
			{#each getAvailableFormats() as format (format.key)}
				<option value={format.key}>{format.name}</option>
			{/each}
		</select>
		<span class="text-subtle pointer-events-none absolute top-0 right-1.5 py-2.5 text-xs">
			<BiChevronDown aria-hidden="true" />
		</span>
	</div>
	{#await citations}
		<div class="flex h-36 items-center justify-center" in:fade={{ duration: 200 }}>
			<span class="size-6">
				<Spinner />
			</span>
		</div>
	{:then citations}
		{@const displayedFormats = getDisplayedFormats(citations)}
		{#if displayedFormats && displayedFormats.length}
			<ul class="mt-2 flex flex-col gap-1">
				{#each displayedFormats as format (format.key)}
					<li>
						<Citation citation={format} {id} />
					</li>
				{/each}
			</ul>
		{/if}
		{#if citations.error}
			<p role="alert" class="my-2 text-xs">
				{page.data.t('errors.somethingWentWrong')}: {citations.error.message}
			</p>
		{/if}
	{/await}
</div>
