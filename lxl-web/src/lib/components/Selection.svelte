<script lang="ts">
	import type { getSelectionContext } from '#lib/contexts/selection.svelte.ts';
	import { getUserSettings } from '#lib/contexts/userSettings.ts';
	import { getCitationsFromSelection } from '#lib/remotes/citeSelection.remote.ts';
	import type { AvailableCitationFormat, CitationData } from '#lib/types/citation.ts';
	import { getAvailableFormats } from '#lib/utils/citation.ts';
	import { page } from '$app/state';
	import BiChevronDown from '~icons/bi/chevron-down';
	import Citations2 from './Citations2.svelte';

	interface Props {
		selection: ReturnType<typeof getSelectionContext>;
		defaultFormat?: AvailableCitationFormat;
	}

	let { selection, defaultFormat }: Props = $props();
	const userSettings = getUserSettings();
	let loading = $state(false);
	let data: CitationData | undefined = $state();

	const allSelections = $derived(selection.getAll);
	const availableCitationFormats = getAvailableFormats();
	let selectedFormat = $state(defaultFormat || availableCitationFormats[0].key);

	function handleChangeFormat(e: Event): void {
		const target = e.target as HTMLSelectElement;
		userSettings.saveSelectedCitationFormat(target.value as AvailableCitationFormat);
	}

	async function execute() {
		loading = true;

		try {
			const citation = await getCitationsFromSelection({
				ids: allSelections,
				format: selectedFormat
			});
			data = {
				...availableCitationFormats.filter((a) => a.key === selectedFormat)?.[0],
				citation: citation
			};
		} catch (e) {
			console.log('noo', e);
		} finally {
			loading = false;
		}
	}
</script>

<div class="text-sm">
	<div class="flex items-center gap-4">
		<p class="font-medium">{allSelections.length} valda</p>
		<button class="btn btn-primary" onclick={() => selection.clear()}> Rensa </button>
	</div>

	<div class="mt-4 flex flex-col gap-2">
		<fieldset class="flex items-center gap-2">
			<legend class="mb-2">Skapa referenser av ditt urval</legend>
			<label for="citation-format-select" class="sr-only"
				>{page.data.t('citations.selectFormat')}:</label
			>
			<div class="relative w-min">
				<select
					class="btn btn-primary appearance-none pr-8"
					bind:value={selectedFormat}
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
			<button class="btn btn-accent" type="button" onclick={execute}>Skapa</button>
		</fieldset>
		{#if loading}
			<p>Laddar...</p>
		{:else if data}
			<Citations2 {data} id="123" />
		{/if}
	</div>
</div>
