<script lang="ts">
	import { type Image, Widths } from '$lib/utils/auxd.types';
	import placeholder from '$lib/assets/img/placeholder.svg';
	import getTypeIcon from '$lib/utils/getTypeIcon';
	import { bestSize } from '$lib/utils/auxd';
	import { first } from '$lib/utils/xl';

	export let images: Image[];
	export let alt: string | undefined;
	export let linkToFull = false;
	export let type = '';
	export let thumbnailTargetWidth: number = Widths.SMALL;
	export let showPlaceholder = true;
	export let loading: 'eager' | 'lazy' = 'eager';

	$: image = first(images);

	$: thumb = bestSize(image, thumbnailTargetWidth);
	$: full = bestSize(image, Widths.FULL);
</script>

{#if image}
	{#if linkToFull}
		<a href={full.url} target="_blank" class="contents">
			<img
				{alt}
				{loading}
				src={thumb.url}
				width={thumb.widthṔx}
				height={thumb.heightPx}
				class="object-contain object-center"
			/>
		</a>
	{:else}
		<img
			{alt}
			{loading}
			src={thumb.url}
			width={thumb.widthṔx}
			height={thumb.heightPx}
			class="object-contain object-center"
		/>
	{/if}
{:else if showPlaceholder}
	<div class="flex items-center justify-center">
		<img src={placeholder} alt="" class="h-20 w-20 rounded-sm object-cover" />
		{#if getTypeIcon(type)}
			<svelte:component this={getTypeIcon(type)} class="absolute text-2xl text-icon" />
		{/if}
	</div>
{/if}
