<script lang="ts">
	import type { getSelectionContext } from '#lib/contexts/selection.svelte.ts';
	import { getUserSettings } from '#lib/contexts/userSettings.ts';
	import type { AvailableCitationFormat } from '#lib/types/citation.ts';
	import { getAvailableFormats } from '#lib/utils/citation.ts';
	import { page } from '$app/state';
	import BiChevronDown from '~icons/bi/chevron-down';
	import Citations2 from './Citations2.svelte';

	interface Props {
		selection: ReturnType<typeof getSelectionContext>;
	}

	let { selection }: Props = $props();

	const userSettings = getUserSettings();

	const availableCitationFormats = getAvailableFormats();

	let selectedFormat = $derived(availableCitationFormats.find((f) => f.key === selection.format));

	const citation = $derived(selection.citation);

	function handleChangeFormat(event: Event) {
		const format = (event.currentTarget as HTMLSelectElement).value as AvailableCitationFormat;

		userSettings.saveSelectedCitationFormat(format);
	}
</script>

<div class="text-sm">
	<div class="flex items-center gap-4">
		<p class="font-medium">{selection.length} valda</p>
		<button class="btn btn-primary" onclick={() => selection.clear()}> Rensa </button>
	</div>

	<div class="mt-4 flex flex-col gap-2">
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

		{#if selection.loading}
			<p>Laddar...</p>
		{:else if selection.length > 0}
			<Citations2 {citation} format={selectedFormat} />
		{/if}
	</div>
</div>
