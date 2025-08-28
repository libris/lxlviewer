<script lang="ts">
	import type { CSLJSON } from '$lib/types/citation';
	import { getAvailableFormats, initCite } from '$lib/utils/citation';
	import { onMount } from 'svelte';

	type Props = {
		citations: CSLJSON[];
	};

	let { citations }: Props = $props();

	const preElements = ['ris', 'bibtex', 'csl'];
	let selectedFormat = $state('all');

	let cite: Awaited<ReturnType<typeof initCite>> | null = $state(null);
	let formattedData = $state();
	const displayedData = $derived(
		formattedData &&
			formattedData.filter((format) =>
				selectedFormat === 'all' ? true : format.key === selectedFormat
			)
	);

	async function load() {
		cite = await initCite();
		cite.add(citations);

		const availableFormats = getAvailableFormats();
		formattedData = availableFormats.map((format) => {
			return {
				...format,
				citation: cite?.format(format.key)
			};
		});
	}

	onMount(() => {
		load();
	});
</script>

<div>
	<select class="btn btn-primary" bind:value={selectedFormat}>
		<option value="all">Alla format</option>
		{#each getAvailableFormats() as format (format.key)}
			<option value={format.key}>{format.name}</option>
		{/each}
	</select>
	<div class="flex flex-col gap-1">
		{#if displayedData && displayedData.length}
			{#each displayedData as style (style.key)}
				<div class="my-2 text-xs">
					<p class="mb-2 font-bold">{style.name}</p>
					<svelte:element this={preElements.some((e) => e === style.key) ? 'pre' : 'span'}>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html style.citation}
					</svelte:element>
				</div>
			{/each}
		{/if}
	</div>
</div>
