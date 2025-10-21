<script lang="ts">
	import { getUserSettings } from '$lib/contexts/userSettings';
	import type { AvailableCitationFormat, CitationsType } from '$lib/types/citation';
	import { getAvailableFormats } from '$lib/utils/citation';
	import { fade } from 'svelte/transition';
	import { page } from '$app/state';
	import Spinner from './Spinner.svelte';
	import BiCopy from '~icons/bi/copy';
	import BiDownload from '~icons/bi/download';
	import BiChevronDown from '~icons/bi/chevron-down';

	type Props = {
		citations: Promise<CitationsType>;
		id: string | undefined | null;
	};

	let { citations, id }: Props = $props();
	const userSettings = getUserSettings();

	let wasCopied: Record<string, boolean> = $state({});
	let selectedFormat = $state(userSettings.selectedCitationFormat || 'all');

	function getDisplayedFormats(citations: CitationsType) {
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
					{@const isFileFormat = !!format?.fileFormat}
					<li
						class="bg-page border-r-neutral border-b-neutral flex flex-col gap-2 rounded-sm border-r border-b p-4 text-xs"
					>
						<h2 class="mb-2 font-medium" id={format.key}>{format.fullName || format.name}</h2>
						<svelte:element
							this={isFileFormat ? 'pre' : 'p'}
							class={[
								'mb-2 block',
								isFileFormat && 'text-2xs overflow-x-scroll [scrollbar-width:thin]'
							]}
						>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html format.citation}
						</svelte:element>
						<div class="flex gap-2">
							<!-- copy button -->
							<button
								class="btn btn-accent"
								onclick={() =>
									handleCopyCitation(
										format.citation,
										isFileFormat ? 'text/plain' : 'text/html',
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
							{#if isFileFormat && id}
								<!-- download button -->
								<a
									class="btn btn-accent"
									download={`${id}.${format.fileFormat}`}
									href={`/api/${page.data.locale}/cite?id=${id}&format=${format.key}`}
								>
									<BiDownload />
									{page.data.t('citations.saveAsFile')}</a
								>
							{/if}
						</div>
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
