<script lang="ts">
	import type { SuperSearchResultItem } from '$lib/types/search';
	import getTypeIcon from '$lib/utils/getTypeIcon';
	import placeholder from '$lib/assets/img/placeholder.svg';
	import { page } from '$app/stores';

	type Props = {
		item: SuperSearchResultItem;
	};

	const { item }: Props = $props();
</script>

<div class="pointer-events-none relative flex">
	{#if item.image}
		<img
			src={item.image.url}
			width={item.image.widthṔx}
			height={item.image.heightPx}
			alt={$page.data.t('general.latestInstanceCover')}
			class={[
				'aspect-square object-contain object-top',
				item['@type'] === 'Person' && 'rounded-full'
			]}
		/>
		{#if item['@type'] !== 'Text' && item['@type'] !== 'Person' && getTypeIcon(item['@type'])}
			{@const SvelteComponent = getTypeIcon(item['@type'])}
			<div class="absolute -left-2 -top-2">
				<div class="rounded-md bg-main p-1.5">
					<SvelteComponent class="h-3 w-3 text-icon-strong" />
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
			{#if getTypeIcon(item['@type'])}
				{@const SvelteComponent_1 = getTypeIcon(item['@type'])}
				<SvelteComponent_1 class="absolute text-lg text-icon" />
			{/if}
		</div>
	{/if}
</div>
