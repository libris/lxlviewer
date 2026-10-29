<script lang="ts">
	import { page } from '$app/state';
	import BiDownload from '~icons/bi/download';
	import BiCopy from '~icons/bi/copy';
	import type { CitationData } from '#lib/types/citation.ts';

	type Props = {
		citation: string;
		format: CitationData;
		loading: boolean;
		id?: string | undefined | null;
	};

	const { citation, format, id, loading = false }: Props = $props();

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

	let wasCopied: Record<string, boolean> = $state({});
	const isFileFormat = $derived(!!format?.fileFormat);
</script>

<article
	class="citation bg-page border-r-neutral border-b-neutral flex flex-col gap-2 rounded-sm border-r border-b p-4 text-xs"
	aria-labelledby={format.key}
	aria-busy={loading}
>
	<h2 class="mb-2 text-sm font-medium" id={format.key}>
		{format.fullName || format.name}
	</h2>
	{#if loading}
		<div class="flex flex-col gap-2 overflow-hidden">
			{#each new Array(3)}
				<div class="skeleton bg-neutral min-h-2 w-full"></div>
				<div class="skeleton bg-neutral min-h-2 w-3/4"></div>
				<div class="skeleton bg-neutral mb-2 min-h-2 w-5/6"></div>
			{/each}
		</div>
	{:else}
		<svelte:element
			this={isFileFormat ? 'pre' : 'p'}
			class={['mb-2 block', isFileFormat && 'text-2xs overflow-x-scroll scrollbar-thin']}
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html citation}
		</svelte:element>
		<div class="flex gap-2">
			<!-- copy button -->
			<button
				class="btn btn-accent"
				onclick={() =>
					handleCopyCitation(citation, isFileFormat ? 'text/plain' : 'text/html', () => {
						wasCopied = {};
						wasCopied[format.key] = true;
					})}
			>
				<BiCopy />
				{#if wasCopied[format.key]}
					{page.data.t('general.copied')}
				{:else}
					{page.data.t('general.copyToClipboard')}
				{/if}
				<span class="sr-only">({format.name})</span>
			</button>
			{#if isFileFormat && id}
				<!-- download button -->
				<a
					class="btn btn-accent"
					download={`${id}.${format.fileFormat}`}
					href={`/api/${page.data.locale}/cite?id=${id}&format=${format.key}`}
				>
					<BiDownload />
					{page.data.t('citations.saveAsFile')}
					<span class="sr-only">({format.name})</span>
				</a>
			{/if}
		</div>
	{/if}
</article>

<style>
	.citation :global(.csl-entry) {
		margin-bottom: calc(var(--spacing) * 2);
	}
</style>
