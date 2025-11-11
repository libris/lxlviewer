<script lang="ts">
	import { page } from '$app/state';
	import type { FacetValue, FacetRange } from '$lib/types/search';
	import DecoratedDataLite from '$lib/components/DecoratedDataLite.svelte';
	import { goto } from '$app/navigation';

	let { data, level, isGroup }: { data: unknown; level: number; isGroup: boolean } = $props();

	function findDeepSelected(o) {
		if (o.selected) return o;
		if (o.facets) {
			for (const facet of o.facets) {
				const found = findDeepSelected(facet);
				if (found) return found;
			}
		}
		if (o.values) {
			for (const valueItem of o.values) {
				const found = findDeepSelected(valueItem);
				if (found) return found;
			}
		}
	}

	const withCheckbox = $derived(data.parentFacet?.operator === 'OR' || (level > 1 && data.values));
	let selected = $derived(withCheckbox && data?.selected);
	let hasDeepSelected: boolean | undefined = $derived(
		withCheckbox && !selected && !!findDeepSelected(data)
	);

	const href = $derived(data.view ? page.data.localizeHref(data.view['@id']) : undefined);

	function handleToggleSelected() {
		if (withCheckbox) {
			selected = !selected;
			hasDeepSelected = undefined;
			goto(href);
		}
	}

	console.log('isGroup', isGroup);
</script>

{#snippet label(data: FacetValue | FacetRange)}
	<span class="truncate">
		{#if typeof data.label === 'object'}
			{#if data.label.decorated}
				<DecoratedDataLite data={data.label.decorated} />
			{:else}
				{data.label.str}
			{/if}
		{:else}
			{data.label}
		{/if}
	</span>
{/snippet}

{#snippet link({ data, tabindex }: { data: FacetValue | FacetRange; tabindex?: number })}
	<a
		{href}
		class="flex size-full items-center"
		data-sveltekit-preload-data="false"
		onclick={handleToggleSelected}
		{tabindex}
	>
		{@render label(data)}
	</a>
{/snippet}

<div class="hover:bg-primary-100 flex flex-1 items-center gap-1.5">
	{#if withCheckbox}
		<input
			type="checkbox"
			class="cursor-pointer"
			bind:checked={selected}
			bind:indeterminate={hasDeepSelected}
			onclick={handleToggleSelected}
			ontoggle={handleToggleSelected}
		/>
	{/if}
	{#if data.view}
		{@render link({ data, tabindex: withCheckbox ? -1 : undefined })}
	{:else}
		{@render label(data)}
	{/if}
</div>
