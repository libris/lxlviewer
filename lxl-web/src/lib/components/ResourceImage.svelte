<script lang="ts">
	import { page } from '$app/stores';
	import { getResourceId } from '$lib/utils/resourceData';
	import type { ResourceData } from '$lib/types/ResourceData';
	import placeholderBook from '$lib/assets/img/placeholder-book.svg';

	export let resource: ResourceData;
	export let alt: string | undefined;

	$: src = $page.data.images.find(
		(uri) => uri.recordId?.replace(/#it/g, '') === getResourceId(resource)
	)?.imageUri;
</script>

{#if src}
	<img {alt} {src} class="object-contain object-center" />
{:else}
	<img src={placeholderBook} alt="" class="object-contain object-center" />
{/if}
