<script lang="ts">
	import type { ResourceData } from '$lib/types/ResourceData';
	import { page } from '$app/stores';
	import { goto, replaceState } from '$app/navigation';
	import jmespath from 'jmespath';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { getResourceId } from '$lib/utils/resourceData';
	import { relativizeUrl } from '$lib/utils/http';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';
	import placeholderBook from '$lib/assets/img/placeholder-book.svg';

	/**
	 * TODO:
	 * - [] Replace jmespath (used for queriyng data for the columns) with something more home-baked (with smaller bundle-size). Another alternative could be querying and preparing the column data server-side?
	 * - [] Add tests (e.g. rows should be expandable and permalink should work, and that opened state should be saved when navigating forward and backwards). The tests should probably be placed inside +page.svelte...
	 */

	let instancesList: HTMLUListElement;
	let expandedInSearchParams = $page.url.searchParams.getAll('expanded') || [];

	export let data: ResourceData;
	export let imageUris: { recordId: string; imageUri: string }[];
	export let columns: string[];

	function handleToggleDetails(state: { expandedInstances?: string[] }) {
		let openIds: string[] = [];
		instancesList.querySelectorAll('details[open]').forEach((openElement) => {
			const parentId = openElement.parentElement?.id;
			if (parentId) {
				openIds = [...openIds, parentId];
			}
		});

		// Only replace state if opened details elements have changed since last toggle event
		if (
			!state.expandedInstances?.every((value) => openIds.includes(value)) ||
			!openIds?.every((value) => state.expandedInstances?.includes(value))
		) {
			replaceState(window.location.href, {
				...state,
				expandedInstances: openIds
			});
		}
	}

	function getCollapseAllUrl(url: URL) {
		const newSearchParams = new URLSearchParams([...Array.from(url.searchParams.entries())]);
		url.searchParams.delete('expanded');
		return `${url.origin}${url.pathname}${newSearchParams.size ? '?' + newSearchParams.toString() : ''}`;
	}

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

	function handleSummaryKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowUp') {
			(event.target as HTMLElement)
				.closest('li')
				?.previousElementSibling?.querySelector('summary')
				?.focus();
		}
		if (event.key === 'ArrowDown') {
			(event.target as HTMLElement)
				.closest('li')
				?.nextElementSibling?.querySelector('summary')
				?.focus();
		}
	}

	function getImageUri(item) {
		return imageUris.find((uri) => {
			return relativizeUrl(uri.recordId)?.replace(/#it/g, '') === getInstanceId(item);
		})?.imageUri;
	}

	function getInstanceId(item: ResourceData) {
		return relativizeUrl(item?.['@id' as keyof ResourceData]);
	}
</script>

<div>
	{#if Array.isArray(data) && data.length > 1}
		<div class="flex justify-end py-4">
			<a
				href={getCollapseAllUrl($page.url)}
				class="close-all"
				on:click={(event) => {
					event.preventDefault();
					replaceState(getCollapseAllUrl($page.url), { ...$page.state, expandedInstances: [] });
				}}
			>
				{$page.data.t('general.collapseAll')}
			</a>
		</div>
	{/if}

	{#if Array.isArray(data)}
		<ul bind:this={instancesList}>
			{#each data as item (item['@id'])}
				{@const id = relativizeUrl(getResourceId(item))}
				{@const cover = getImageUri(item)}
				<li {id} class="border-t border-t-primary/16">
					<details
						{...id && {
							open:
								(!$page.state.expandedInstances && expandedInSearchParams.includes(id)) ||
								$page.state.expandedInstances?.includes(id) ||
								data.length === 1
						}}
						on:toggle={() => handleToggleDetails($page.state)}
					>
						<summary
							class="flex min-h-11 gap-2 px-2 py-4 align-middle hover:bg-pill/16"
							on:keydown={handleSummaryKeydown}
						>
							{#each columns as columnItem}
								<div class="flex flex-1 items-center">
									<DecoratedData data={jmespath.search(item, columnItem)} />
								</div>
							{/each}
						</summary>
						<div class="grid gap-2 px-2 pb-8 pt-4 md:grid-cols-3">
							<div class="flex flex-col gap-4">
								<div class="flex h-full max-h-32 w-full max-w-32">
									{#if cover}
										<img
											alt={$page.data.t('general.instanceCover')}
											src={cover}
											class="object-contain object-left"
										/>
									{:else}
										<img src={placeholderBook} alt="" class="object-contain object-left" />
									{/if}
								</div>
								{#if id}
									<a
										href={getPermalink($page.url, id)}
										on:click={(event) => handleCopyPermalink(event, $page.url, id, $page.state)}
									>
										{$page.data.t('general.copyPermalinkToInstance')}
									</a>
								{/if}
							</div>
							<div class="instance-details col-span-2">
								<DecoratedData data={item} block showLabels={ShowLabelsOptions.Always} />
							</div>
						</div>
					</details>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style lang="postcss">
	.close-all {
		@apply text-sm;
		&[disabled] {
			@apply text-disabled;
		}
	}

	:global(.instance-details > div) {
		@apply gap-2 lg:columns-2;
	}

	:global(.instance-details > div div[data-property]) {
		@apply mb-4;
	}

	:global(.instance-details > div > *) {
		break-inside: avoid-column;
	}

	details[open] > summary {
		@apply bg-pill/8 hover:bg-pill/16;
	}
</style>
