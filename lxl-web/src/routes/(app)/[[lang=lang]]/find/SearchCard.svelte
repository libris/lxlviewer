<script lang="ts">
	import { relativize } from '$lib/utils/http';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { LxlLens } from '$lib/utils/display.types';
	import type { FramedData } from '$lib/utils/xl';

	export let item: FramedData;
	console.log(item[LxlLens.CardBody]._display);
</script>

<li class="search-card flex flex-col gap-2 rounded-md border-b border-b-primary/16 bg-cards p-6">
	<a href={relativize(item['@id'])} class="text-primary no-underline text-3-cond-bold"
		><h2>
			<DecoratedData data={item[LxlLens.CardHeading]} />
		</h2></a
	>
	<div class="search-card-body flex gap-4 text-2-regular">
		{#each item[LxlLens.CardBody]._display as property}
			<span class="flex flex-col gap-2">
				<span class="text-secondary">{property?._label}</span>
				<span class="decorated-wrapper">
					<DecoratedData data={property} />
				</span>
			</span>
		{/each}
	</div>
</li>

<style>
	.search-card-body {
		@apply grid grid-cols-2 grid-rows-1;
		grid-template-areas: 'contribution hasInstance';
	}
</style>
