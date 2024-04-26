<script lang="ts">
	import { page } from '$app/stores';
	import { getResourceId } from '$lib/utils/resourceData';
	import type { ResourceData } from '$lib/types/ResourceData';
	import placeholder from '$lib/assets/img/placeholder.svg';
	import getTypeIcon from '$lib/utils/getTypeIcon';

	export let resource: ResourceData;
	export let alt: string | undefined;
	export let linkToFull = false;
	export let type = '';

	$: src = $page.data.images.find(
		(uri) => uri.recordId?.replace(/#it/g, '') === getResourceId(resource)
	)?.imageUri;
</script>

{#if src}
	{#if linkToFull}
		<a href={src} target="_blank" class="contents">
			<img {alt} {src} class="object-contain object-center" />
		</a>
	{:else}
		<img {alt} {src} class="object-contain object-center" />
	{/if}
{:else}
	<div class="flex items-center justify-center">
		<img src={placeholder} alt="" class="h-20 w-20 rounded-sm object-cover" />
		{#if getTypeIcon(type)}
			<svelte:component this={getTypeIcon(type)} class="absolute text-2xl text-icon" />
		{/if}
	</div>
{/if}
