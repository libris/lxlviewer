<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import type { FacetValue as FacetValueType } from '$lib/types/search';
	import { JsonLd } from '$lib/types/xl';
	import FacetLink from './FacetLink.svelte';

	type Props = {
		items: FacetValueType[];
		level: number;
		parentLabel: string;
		enhanced: boolean;
	};
	const { items, level, parentLabel, enhanced }: Props = $props();

	function handleChange(e: Event) {
		const target = e.currentTarget as HTMLInputElement;

		goto(page.data.localizeHref(target.value), {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}
</script>

{#if enhanced}
	<form data-testid={level === 1 ? 'facet-list' : undefined}>
		<fieldset>
			<legend class="sr-only">{parentLabel}</legend>
			{#each items as item, index (parentLabel + item.str + index)}
				<label class="block px-4 py-1.5 text-sm hover:bg-primary-100 focus-within:bg-accent-50">
					<input
						type="checkbox"
						class="mr-0.5"
						value={item.view[JsonLd.ID]}
						checked={item.selected}
						onchange={handleChange}
					/>
					<span>{item.str}</span>
					{#if item.discriminator}
						<span class="text-subtle text-2xs">({item.discriminator})</span>
					{/if}
					<span class="text-placeholder ml-1 text-xs"
						>{item.totalItems.toLocaleString(page.data.locale)}</span
					>
					<span class="sr-only">
						{item.totalItems === 1 ? page.data.t('search.hitsOne') : page.data.t('search.hits')}
					</span>
				</label>
			{/each}
		</fieldset>
	</form>
{:else}
	<!-- fallback -->
	{#each items as item, index (parentLabel + item.str + index)}
		<FacetLink data={item} className="with-checkbox" />
	{/each}
{/if}

<style>
	label {
		padding-left: calc(((var(--level, 0) - 1) * var(--spacing) * 5.5) + var(--spacing) * 4);
		padding-right: calc(var(--spacing) * 3);
	}
</style>
