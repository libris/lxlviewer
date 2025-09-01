<script lang="ts">
	import { page } from '$app/state';
	import { getHoldingsLink, getMyLibsFromHoldings, handleClickHoldings } from '$lib/utils/holdings';
	import { relativizeUrl } from '$lib/utils/http';
	import { getResourceId } from '$lib/utils/resourceData';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import MyLibrariesIndicator from '$lib/components/MyLibsHoldingIndicator.svelte';
	import type { HoldersByType } from '$lib/types/holdings';
	import type { ResourceData } from '$lib/types/resourceData';
	import { JsonLd } from '$lib/types/xl';

	interface Props {
		instances: Record<string, unknown>[]; // TODO: fix better types
		holdersByType: HoldersByType;
	}

	let { holdersByType, instances }: Props = $props();

	const userSettings = getUserSettings();

	function getLocalizedType(type: string) {
		return instances.find((instanceItem) => type === instanceItem[JsonLd.TYPE])?._label || type;
	}
</script>

<ul class="@container flex flex-col gap-2">
	{#each Object.keys(holdersByType) as type (type)}
		<li>
			<a
				class="btn btn-cta"
				href={getHoldingsLink(page.url, type)}
				data-sveltekit-preload-data="false"
				data-testid="holding-link"
				onclick={(event) => handleClickHoldings(event, page.state, type)}
			>
				{getLocalizedType(type)}
				<span class="text-2xs truncate font-normal opacity-90">
					{' · '}
					<span class="hidden @3xs:inline">{page.data.t('holdings.availableAt').toLowerCase()}</span
					>
					{holdersByType[type].length}
					{holdersByType[type].length === 1
						? page.data.t('holdings.library')
						: page.data.t('holdings.libraries')}
				</span>
			</a>
		</li>
	{/each}
</ul>
{#if instances.length === 1}
	{@const id = relativizeUrl(getResourceId(instances[0] as ResourceData))}
	{#if id}
		{@const favWithHolding = getMyLibsFromHoldings(
			userSettings.myLibraries,
			page.data.holdingsByInstanceId[id]
		)}
		{#if favWithHolding.length}
			<div class="mt-2 text-2xl">
				<MyLibrariesIndicator libraries={favWithHolding} />
			</div>
		{/if}
	{/if}
{/if}
