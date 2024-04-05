<script lang="ts">
	import type { ResourceData } from '$lib/types/ResourceData';
	import { page } from '$app/stores';
	import { goto, replaceState } from '$app/navigation';
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

	export let data: ResourceData;
	export let columns: string[];

	function handleToggleDetails(event: Event) {
		const detailsElement = event.target as HTMLDetailsElement;
		const id = detailsElement.parentElement?.id;

		if (detailsElement.open && id) {
			replaceState($page.url, {
				expandedInstances: [...new Set([...($page.state.expandedInstances || []), id])]
			});
		} else {
			replaceState($page.url, {
				expandedInstances: $page.state.expandedInstances?.filter((expandedId) => expandedId !== id)
			});
		}
	}

	function handleCollapseAll() {
		replaceState($page.url, { expandedInstances: [] });
	}

	function getPermalink(item: ResourceData) {
		return `${$page.url.pathname}${($page.url.searchParams.size && '?' + $page.url.searchParams.toString()) || ''}#${relativizeUrl(getResourceId(item))}`;
	}

	function handlePermalinkClick(event: Event) {
		const id = new URL((event.target as HTMLLinkElement).href).hash.replace('#', '');
		const newUrl = new URL($page.url);
		newUrl.hash = id;
		navigator.clipboard.writeText(newUrl.toString());
		goto(newUrl, {
			state: {
				...$page.state,
				expandedInstances: [...new Set([...($page.state.expandedInstances || []), id])]
			},
			noScroll: true
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
</script>

<div>
	<div class="flex justify-end py-4">
		<button
			class="close-all"
			on:click={handleCollapseAll}
			disabled={!$page.state.expandedInstances?.length}
			>{$page.data.t('general.collapseAll')}</button
		>
	</div>
	{#if Array.isArray(data)}
		<ul>
			{#each data as item (item['@id'])}
				{@const id = relativizeUrl(getResourceId(item))}
				<li {id} class="border-t border-t-primary/16">
					<details
						open={(id &&
							(($page.state.expandedInstances === undefined && $page.url.hash.includes(id)) ||
								!!$page.state.expandedInstances?.includes(id))) ||
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
						<div class="grid grid-cols-3 gap-2 px-2 pb-4 pt-2">
							<div>
								{#if id}
									<a href={getPermalink(item)} on:click|preventDefault={handlePermalinkClick}>
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
		columns: 2;
	}

	:global(.instance-details > div > *) {
		break-inside: avoid-column;
	}
</style>
