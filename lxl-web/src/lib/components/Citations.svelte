<script lang="ts">
	import type { CSLJSON } from '$lib/types/citation';
	import { getAvailableFormats, initCite } from '$lib/utils/citation';
	import { onMount } from 'svelte';
	import Spinner from './Spinner.svelte';
	import { fade } from 'svelte/transition';
	import { page } from '$app/state';

	type Props = {
		citations: CSLJSON[];
	};

	let { citations }: Props = $props();

	let loading = $state(false);
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
		loading = true;
		cite = await initCite();
		cite.add(citations);

		const availableFormats = getAvailableFormats();
		formattedData = availableFormats.map((format) => {
			return {
				...format,
				citation: cite.format(format.key)
			};
		});
		loading = false;
	}

	onMount(() => {
		load();
	});
</script>

<div>
	<label for="citation-format-select" class="sr-only">{page.data.t('citations.selectFormat')}</label
	>
	<select class="btn btn-primary" bind:value={selectedFormat} id="citation-format-select">
		<option value="all">{page.data.t('citations.allFormats')}</option>
		{#each getAvailableFormats() as format (format.key)}
			<option value={format.key}>{format.name}</option>
		{/each}
	</select>
	{#if loading}
		<div class="flex h-36 items-center justify-center" in:fade={{ duration: 200 }}>
			<span class="size-6">
				<Spinner />
			</span>
		</div>
	{/if}
	<ul class="mt-2 flex flex-col gap-1">
		{#if displayedData && displayedData.length}
			{#each displayedData as style (style.key)}
				<li class="my-2 text-xs">
					<h2 class="mb-2 font-medium" id={style.key}>{style.fullName || style.name}</h2>
					<svelte:element
						this={preElements.some((e) => e === style.key) ? 'pre' : 'p'}
						class="block rounded-sm bg-neutral-100 p-2"
					>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html style.citation}
					</svelte:element>
				</li>
			{/each}
		{/if}
	</ul>
</div>
