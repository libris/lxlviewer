<script lang="ts">
	import { page } from '$app/state';
	import type { SuperSearchResultItem } from '$lib/types/search';
	import placeholder from '$lib/assets/img/placeholder.svg';
	import TypeIcon from '$lib/components/TypeIcon.svelte';

	type Props = {
		item: SuperSearchResultItem;
	};

	const { item }: Props = $props();
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
		{#if item['@type'] !== 'Text' && item['@type'] !== 'Person'}
			<div class="absolute -top-1.5 -left-1.5">
				<div class="bg-page rounded-sm border border-neutral-100 p-1">
					<TypeIcon type={item.typeForIcon} class="size-3" />
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
			<TypeIcon type={item.typeForIcon} class="absolute text-lg text-neutral-400" />
		</div>
	{/if}
</div>
