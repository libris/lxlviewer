<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import type { FacetSearch } from '$lib/types/search';
	import BiSearch from '~icons/bi/search';

	interface Props {
		search: FacetSearch;
	}

	let { search }: Props = $props();

	let rangeFrom = $state(search.mapping.greaterThanOrEquals);
	let rangeTo = $state(search.mapping.lessThanOrEquals);

	afterNavigate(() => {
		rangeFrom = search.mapping.greaterThanOrEquals;
		rangeTo = search.mapping.lessThanOrEquals;
	});

	function handleSubmit(e: SubmitEvent) {
		if (!rangeFrom && !rangeTo) {
			e.preventDefault();
		}
	}
	let searchParams = $derived(new URLSearchParams(search.template.replace('/find?', '')));
	let qOutput = $derived(
		searchParams
			.get('_q')
			?.replace(
				`{?${search.mapping.variable}}`,
				`${search.mapping.variable}:${rangeFrom ? rangeFrom : ''}-${rangeTo ? rangeTo : ''}`
			)
	);
</script>

<form
	class="[&_label]:text-subtle grid grid-cols-[1fr_1fr_auto] items-end gap-2 p-2"
	action=""
	onsubmit={handleSubmit}
>
	<div class="flex flex-col gap-1">
		<label class="sr-only" for="facet-range-from">{page.data.t('general.from')}</label>
		<input
			class="bg-input h-8 rounded-sm border border-neutral-300 px-2 py-1"
			id="facet-range-from"
			type="number"
			min="1000"
			max="2099"
			step="1"
			placeholder={`${page.data.t('general.from')} (${page.data.t('general.year')})`}
			bind:value={rangeFrom}
		/>
	</div>
	<div class="flex flex-col gap-1">
		<label class="sr-only" for="facet-range-to">{page.data.t('general.to')}</label>
		<input
			class="bg-input h-8 rounded-sm border border-neutral-300 px-2 py-1"
			id="facet-range-to"
			type="number"
			min="1000"
			max="2099"
			step="1"
			placeholder={`${page.data.t('general.to')} (${page.data.t('general.year')})`}
			bind:value={rangeTo}
		/>
	</div>
	<button
		class="btn btn-primary size-8"
		disabled={!rangeFrom && !rangeTo}
		type="submit"
		aria-label={page.data.t('general.apply')}
	>
		<BiSearch class="text-base" />
	</button>

	{#each searchParams as [name, value], index (index)}
		{#if name !== '_q'}
			<input type="hidden" {name} {value} />
		{/if}
	{/each}
	<input type="hidden" name="_q" value={qOutput} />
</form>

<style lang="postcss">
	@reference 'tailwindcss';

	form {
		padding-left: calc((var(--level, 0) * var(--spacing) * 5) + var(--spacing) * 3);
	}
</style>
