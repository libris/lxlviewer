<script lang="ts">
	import type { ResourceData } from '$lib/types/ResourceData';
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import jmespath from 'jmespath';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { relativizeUrl } from '$lib/utils/http';
	import {
		getPreviousElementSiblingWithSelector,
		getNextElementSiblingWithSelector
	} from '$lib/utils/elements';

	/**
	 * TODO:
	 * - [] Replace jmespath (used for queriyng data for the columns) with something more home-baked (with smaller bundle-size)
	 * - [] Support more keyboard functionality and ensure accessibility (see https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/examples/treegrid-1/#kbd_label)
	 * - [] Maybe refactor component into a more generic DecoratedTreeGrid component that can be used on the search results page
	 * - [] Add tests (e.g. that rows should be expandable, keyboard functionality works and URL is updated while history is replaced and scroll position and focus is kept as-is)
	 */

	let expanded = $page.url.searchParams.getAll('expanded');
	let tableElement: HTMLTableElement;

	export let data: DecoratedData;
	export let columns: string[];

	afterNavigate(({ to }) => {
		/** Update expanded value after navigation */
		if (to?.url) {
			expanded = to.url.searchParams.getAll('expanded');
		}
	});

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'ArrowUp') {
			getPreviousElementSiblingWithSelector(
				(event.target as HTMLLinkElement).closest('tr'),
				'tr[aria-level="1"]'
			)
				?.querySelector<HTMLLinkElement>('a.instanceLink')
				?.focus();
		}
		if (event.key === 'ArrowDown') {
			getNextElementSiblingWithSelector(
				(event.target as HTMLLinkElement).closest('tr'),
				'tr[aria-level="1"]'
			)
				?.querySelector<HTMLLinkElement>('a.instanceLink')
				?.focus();
		}
	}

	function getInstanceId(item: ResourceData) {
		return relativizeUrl(item?.['@id' as keyof ResourceData]);
	}

	function getInstanceLink(item: ResourceData, expanded: string[]) {
		const id = relativizeUrl(item?.['@id' as keyof ResourceData]);
		if (!id) {
			return $page.url.pathname;
		}
		let linkParams = new URLSearchParams([...Array.from($page.url.searchParams.entries())]);
		if (!expanded.includes(id)) {
			linkParams.append('expanded', id);
		} else {
			linkParams.delete('expanded', id);
		}

		return `${$page.url.pathname}?${linkParams.toString()}`;
	}

	function getCollapseAllInstancesLink() {
		let linkParams = new URLSearchParams([...Array.from($page.url.searchParams.entries())]);
		linkParams.delete('expanded');
		return `${$page.url.pathname}?${linkParams.toString()}`;
	}
</script>

<div role="treegrid">
	<div class="flex justify-end py-4">
		<a
			href={$page.url.searchParams.getAll('expanded').length
				? getCollapseAllInstancesLink()
				: undefined}
			data-sveltekit-noscroll
			data-sveltekit-keepfocus
			data-sveltekit-replacestate
		>
			Collapse all
		</a>
	</div>
	<table class="w-full table-fixed" bind:this={tableElement}>
		<tbody>
			{#if Array.isArray(data)}
				{#each data as item, index (item['@id'])}
					{@const id = getInstanceId(item)}
					<tr
						class="relative border-t border-t-primary/16"
						aria-level="1"
						aria-setsize="1"
						aria-posinset={index + 1}
						data-id={item['@id']}
						aria-expanded={!!(id && expanded.includes(id))}
					>
						{#each columns as columnItem}
							<td class="p-4">
								<DecoratedData data={jmespath.search(item, columnItem)} />
							</td>
						{/each}
						<td class="absolute left-0 top-0 h-full w-full">
							<a
								class="instanceLink block h-full w-full hover:bg-pill/8"
								href={getInstanceLink(item, expanded)}
								data-sveltekit-noscroll
								data-sveltekit-keepfocus
								data-sveltekit-replacestate
								aria-label="Expandera"
								on:keydown={handleKeyDown}
							/>
						</td>
					</tr>
					<tr aria-level="2" aria-setsize="1" aria-posinset={index + 1}>
						<td class="px-4 pb-4" colspan={columns.length}>
							<DecoratedData data={item} block />
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<style>
	tr[aria-expanded='false'] + tr {
		display: none;
	}
</style>
