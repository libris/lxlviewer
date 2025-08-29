<script lang="ts">
	import type { ResourceData } from '$lib/types/resourceData';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import ResourceImage from '$lib/components/ResourceImage.svelte';
	import { getHoldingsLink, handleClickHoldings } from '$lib/utils/holdings';
	import { getCiteLink, handleClickCite } from '$lib/utils/citation';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	interface Props {
		id: string | undefined;
		data: ResourceData;
		oneOfMany?: boolean;
	}

	let { id, data, oneOfMany = false }: Props = $props();

	function getPermalink(url: URL, id: string) {
		const newSearchParams = new URLSearchParams({ expanded: id });
		return `${url.origin}${url.pathname}?${newSearchParams.toString()}#${id}`;
	}

	function handleCopyPermalink(
		event: MouseEvent,
		url: URL,
		id: string,
		state: {
			expandedInstances?: string[];
		}
	) {
		event.preventDefault();
		const permalink = getPermalink(url, id);
		navigator.clipboard.writeText(permalink.toString());
		goto(permalink, {
			state: {
				...state,
				expandedInstances: [id]
			}
		});
	}
</script>

<div class:oneOfMany>
	{#if oneOfMany}
		<div class="col-span-2 flex flex-col gap-2 text-sm">
			<div class="flex object-left">
				<ResourceImage
					images={page.data.images.filter((i) => i.recordId === id)}
					alt={page.data.t('general.instanceCover')}
					type={page.data.type}
					loading="lazy"
					linkToFull
				/>
			</div>
			{#if id && page.data.holdingsByInstanceId[id]}
				<div class="flex flex-col gap-1">
					<a
						class="link-subtle"
						href={getHoldingsLink(page.url, id)}
						data-sveltekit-preload-data="false"
						onclick={(event) => handleClickHoldings(event, page.state, id)}
					>
						{page.data.t('holdings.availableAt')}
						{page.data.holdingsByInstanceId[id].length}
						{page.data.holdingsByInstanceId[id].length === 1
							? page.data.t('holdings.library')
							: page.data.t('holdings.libraries')}
					</a>
					<a
						class="link-subtle"
						href={getCiteLink(page.url, id)}
						onclick={(event) => handleClickCite(event, page.state)}
						>{page.data.t('citations.createCitation')}</a
					>
					<a
						class="link-subtle"
						href={getPermalink(page.url, id)}
						onclick={(event) => handleCopyPermalink(event, page.url, id, page.state)}
					>
						{page.data.t('general.copyPermalinkToInstance')}
					</a>
				</div>
			{/if}
		</div>
	{/if}
	<div class="instance-details columns col-span-3">
		<DecoratedData {data} block showLabels={ShowLabelsOptions.Always} />
	</div>
</div>

<style lang="postcss">
	@reference "../../../../app.css";

	:global(.columns > div) {
		@apply gap-2 2xl:columns-2 2xl:gap-x-8;
	}

	:global(.columns > div > *) {
		break-inside: avoid-column;
	}

	:global(.instance-details > div div[data-property]) {
		@apply mb-4;
	}

	.oneOfMany {
		@apply sm:grid-cols-instance-list grid grid-cols-1 gap-4 py-8 sm:gap-2;
	}
</style>
