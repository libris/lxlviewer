<script lang="ts">
	import type { SuperSearchResultItem } from '$lib/types/search';
	import getTypeIcon from '$lib/utils/getTypeIcon';
	import placeholder from '$lib/assets/img/placeholder.svg';
	import { page } from '$app/state';

	type Props = {
		item: SuperSearchResultItem;
	};

	const { item }: Props = $props();

	const TypeIcon = $derived(getTypeIcon(item['@type']));
</script>

<div class="pointer-events-none relative flex">
	{#if item.image}
		<img
			src={item.image.url}
			width={item.image.widthPx > 0 ? item.image.widthPx : undefined}
			height={item.image.heightPx > 0 ? item.image.heightPx : undefined}
			alt={page.data.t('general.latestInstanceCover')}
			class={[
				'aspect-square object-contain object-top',
				item['@type'] === 'Person' && 'rounded-full'
			]}
		/>
		{#if item['@type'] !== 'Text' && item['@type'] !== 'Person' && TypeIcon}
			<div class="absolute -top-2 -left-2">
				<div class="rounded-md p-1.5">
					<TypeIcon class="size-3" />
				</div>
			</div>
		{/if}
	{:else}
		<div class="flex items-center justify-center">
			<img
				src={placeholder}
				alt=""
				class={[
					'object-contain object-top',
					item['@type'] === 'Person' ? 'rounded-full' : 'rounded-sm'
				]}
			/>
			{#if TypeIcon}
				<TypeIcon class="absolute text-lg text-neutral-400" />
			{/if}
		</div>
	{/if}
</div>
