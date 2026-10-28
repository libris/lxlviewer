<script lang="ts">
	import { page } from '$app/state';
	import BiDownload from '~icons/bi/download';
	import BiCopy from '~icons/bi/copy';
	import type { CitationData } from '#lib/types/citation.ts';

	type Props = {
		data: CitationData;
		id: string | undefined | null;
	};

	const { data, id }: Props = $props();

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
	const isFileFormat = $derived(!!data?.fileFormat);
</script>

<article
	class="bg-page border-r-neutral border-b-neutral flex flex-col gap-2 rounded-sm border-r border-b p-4 text-xs"
	aria-labelledby={data.key}
>
	<h2 class="mb-2 text-sm font-medium" id={data.key}>
		{data.fullName || data.name}
	</h2>
	<svelte:element
		this={isFileFormat ? 'pre' : 'p'}
		class={['mb-2 block', isFileFormat && 'text-2xs overflow-x-scroll scrollbar-thin']}
	>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html data.citation}
	</svelte:element>
	<div class="flex gap-2">
		<!-- copy button -->
		<button
			class="btn btn-accent"
			onclick={() =>
				handleCopyCitation(data.citation, isFileFormat ? 'text/plain' : 'text/html', () => {
					wasCopied = {};
					wasCopied[data.key] = true;
				})}
		>
			<BiCopy />
			{#if wasCopied[data.key]}
				{page.data.t('general.copied')}
			{:else}
				{page.data.t('general.copyToClipboard')}
			{/if}
			<span class="sr-only">({data.name})</span>
		</button>
		{#if isFileFormat && id}
			<!-- download button -->
			<a
				class="btn btn-accent"
				download={`${id}.${data.fileFormat}`}
				href={`/api/${page.data.locale}/cite?id=${id}&format=${data.key}`}
			>
				<BiDownload />
				{page.data.t('citations.saveAsFile')}
				<span class="sr-only">({data.name})</span>
			</a>
		{/if}
	</div>
</article>
