<script lang="ts">
	import type { ResourceData } from '$lib/types/ResourceData';
	import { page } from '$app/stores';
	import { goto, replaceState, afterNavigate } from '$app/navigation';
	import jmespath from 'jmespath';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { getResourceId } from '$lib/utils/resourceData';
	import { relativizeUrl } from '$lib/utils/http';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';

	/**
	 * TODO:
	 * - [] Replace jmespath (used for queriyng data for the columns) with something more home-baked (with smaller bundle-size). Another alternative could be querying and preparing the column data server-side?
	 * - [] Add tests (e.g. rows should be expandable and permalink should work, and that opened state should be saved when navigating forward and backwards). The tests should probably be placed inside +page.svelte...
	 */

	let expandedInSearchParams = $page.url.searchParams.getAll('expanded') || [];

	afterNavigate(({ to }) => {
		/** Update expanded value after navigation */
		if (to?.url) {
			expandedInSearchParams = to.url.searchParams.getAll('expanded');
		}
	});
	export let data: ResourceData;
	export let imageUris: { recordId: string; imageUri: string }[];
	export let columns: string[];

	function handleToggleDetails(event: Event) {
		const detailsElement = event.target as HTMLDetailsElement;
		const id = detailsElement.parentElement?.id;

		if (detailsElement.open && id) {
			replaceState($page.url, {
				expandedInstances: [...new Set([...($page.state.expandedInstances || []), id])]
			});
		} else if (event instanceof ToggleEvent && event.oldState !== event.newState) {
			{
				replaceState($page.url, {
					expandedInstances: $page.state.expandedInstances?.filter(
						(expandedId) => expandedId !== id
					)
				});
			}
		}
	}

	function handleCollapseAll() {
		const newUrl = new URL($page.url);
		const newSearchParams = new URLSearchParams([...Array.from($page.url.searchParams.entries())]);
		newSearchParams.delete('expanded');
		newUrl.search = newSearchParams.toString();
		newUrl.hash = '';
		// expandedInSearchParams = [];
		goto(newUrl, {
			replaceState: true,
			noScroll: true,
			state: {
				...$page.state,
				expandedInstances: []
			}
		});
		replaceState(newUrl, { expandedInstances: [] });
	}

	function getPermalink(item: ResourceData) {
		const id = relativizeUrl(getResourceId(item));
		const newUrl = new URL($page.url);
		if (id) {
			const newSearchParams = new URLSearchParams([
				...Array.from($page.url.searchParams.entries())
			]);
			newSearchParams.set('expanded', id);
			newUrl.search = newSearchParams.toString();
			newUrl.hash = id;
		}
		return newUrl.toString();
	}

	function handleCopyPermalink(item: ResourceData) {
		const permalink = getPermalink(item);
		navigator.clipboard.writeText(permalink.toString());
		const id = relativizeUrl(getResourceId(item));
		if (id) {
			goto(permalink, {
				state: {
					...$page.state,
					expandedInstances: [id]
				},
				replaceState: true,
				noScroll: true
			});
		}
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
	<div class="flex justify-end py-4">
		<button
			class="close-all"
			on:click={handleCollapseAll}
			disabled={!$page.state.expandedInstances?.length}
		>
			{$page.data.t('general.collapseAll')}
		</button>
	</div>
	{#if Array.isArray(data)}
		<ul>
			{#each data as item (item['@id'])}
				{@const id = relativizeUrl(getResourceId(item))}
				<li {id} class="border-t border-t-primary/16">
					<div
						class="m-2 flex h-[6.5rem] w-20 shrink-0 items-center justify-center rounded-sm bg-[lightgrey] bg-contain bg-no-repeat"
						style="background-image: url('{getImageUri(item)}')"
					></div>
					<details
						open={(id && expandedInSearchParams.includes(id)) ||
							(id && !!$page.state.expandedInstances?.includes(id)) ||
							undefined}
						on:toggle={handleToggleDetails}
					>
						<summary
							class="flex min-h-11 gap-2 px-2 align-middle hover:bg-pill/8"
							on:keydown={handleSummaryKeydown}
						>
							{#each columns as columnItem}
								<div class="flex flex-1 items-center">
									<DecoratedData data={jmespath.search(item, columnItem)} />
								</div>
							{/each}
						</summary>
						<div class="grid gap-2 px-2 pb-8 pt-4 md:grid-cols-3">
							<div class="mb-4">
								{#if id}
									<a
										class="text-sm"
										href={getPermalink(item)}
										on:click={() => handleCopyPermalink(item)}
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
</style>
