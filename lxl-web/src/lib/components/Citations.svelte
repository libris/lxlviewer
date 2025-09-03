<script lang="ts">
	import { getUserSettings } from '$lib/contexts/userSettings';
	import type { AvailableCitationFormat, CSLJSON } from '$lib/types/citation';
	import { getAvailableFormats, initCite } from '$lib/utils/citation';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { page } from '$app/state';
	import Spinner from './Spinner.svelte';
	import BiCopy from '~icons/bi/copy';

	type Props = {
		citations: CSLJSON[];
		error: string;
	};

	let { citations, error }: Props = $props();
	const userSettings = getUserSettings();

	const plainTextFormats = ['ris', 'bibtex', 'csl'];
	let wasCopied: Record<string, boolean> = $state({});

	let loading = $state(false);
	let selectedFormat = $state(userSettings.selectedCitationFormat || 'all');

	let cite: Awaited<ReturnType<typeof initCite>> | null = $state(null);

	let formattedData:
		| {
				key: AvailableCitationFormat;
				name: string;
				fullName?: string;
				citation: string;
		  }[]
		| undefined = $state();

	const displayedFormats = $derived(
		formattedData &&
			formattedData.filter((format) =>
				selectedFormat === 'all' ? true : format.key === selectedFormat
			)
	);

	async function load() {
		if (!error) {
			loading = true;
			cite = await initCite();
			cite.add(citations);

			const availableFormats = getAvailableFormats();
			formattedData = availableFormats.map((format) => {
				return {
					...format,
					citation: cite?.formatAs(format.key) as string
				};
			});
			loading = false;
		}
	}

	function handleChangeFormat(e: Event): void {
		const target = e.target as HTMLSelectElement;
		userSettings.saveSelectedCitationFormat(target.value as AvailableCitationFormat);
	}

	async function handleCopyCitation(
		citation: string,
		type: 'text/html' | 'text/plain' = 'text/plain',
		onSuccess?: () => void
	) {
		if (citation) {
			const blob = new Blob([citation], { type });
			const data = new ClipboardItem({ [type]: blob });
			await navigator.clipboard.write([data]);
			onSuccess?.();
		}
	}

	onMount(() => {
		load();
	});
</script>

<div>
	<label for="citation-format-select" class="sr-only">{page.data.t('citations.selectFormat')}</label
	>
	<select
		class="btn btn-primary"
		bind:value={selectedFormat}
		id="citation-format-select"
		onchange={handleChangeFormat}
	>
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
		{#if displayedFormats && displayedFormats.length}
			{#each displayedFormats as format (format.key)}
				{@const isPlainText = plainTextFormats.some((e) => e === format.key)}
				<li
					class="bg-page border-r-neutral border-b-neutral flex flex-col gap-2 rounded-sm border-r border-b p-4 text-xs"
				>
					<h2 class="mb-2 font-medium" id={format.key}>{format.fullName || format.name}</h2>
					<svelte:element
						this={isPlainText ? 'pre' : 'p'}
						class={[
							'mb-2 block',
							isPlainText && 'text-2xs overflow-x-scroll [scrollbar-width:thin]'
						]}
					>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html format.citation}
					</svelte:element>
					<div>
						<!-- copy button -->
						<button
							class="btn btn-accent"
							onclick={() =>
								handleCopyCitation(
									format.citation,
									isPlainText ? 'text/plain' : 'text/html',
									() => {
										wasCopied = {};
										wasCopied[format.key] = true;
									}
								)}
						>
							<BiCopy />
							{#if wasCopied[format.key]}
								{page.data.t('citations.copied')}
							{:else}
								{page.data.t('citations.copyToClipboard')}
							{/if}
						</button>
					</div>
				</li>
			{/each}
		{/if}
	</ul>
	{#if error}
		<p role="alert" class="text-xs">{page.data.t('errors.somethingWentWrong')}: {error}</p>
	{/if}
</div>
