<script lang="ts">
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import type { FacetSearch } from '$lib/types/search.types';

	export let search: FacetSearch;

	$: searchParams = new URLSearchParams(search.template.replace('/find?', ''));
	$: qOutput = searchParams
		.get('_q')
		?.replace(
			`{?${search.mapping.variable}}`,
			`${rangeFrom ? `${search.mapping.variable}>=${rangeFrom}` : ''} ${rangeTo ? `${search.mapping.variable}<=${rangeTo}` : ''}`
		);

	let rangeFrom = search.mapping.greaterThanOrEquals;
	let rangeTo = search.mapping.lessThanOrEquals;

	afterNavigate(() => {
		rangeFrom = search.mapping.greaterThanOrEquals;
		rangeTo = search.mapping.lessThanOrEquals;
	});

	function handleSubmit(e: SubmitEvent) {
		if (!rangeFrom && !rangeTo) {
			e.preventDefault();
		}
	}
</script>

<form class="my-4 grid grid-cols-3 items-end gap-2" action="" on:submit={handleSubmit}>
	<div class="flex flex-col gap-1">
		<label class="text-1-cond-bold" for="facet-range-from">{$page.data.t('general.from')}</label>
		<input
			id="facet-range-from"
			type="number"
			min="1000"
			max="2099"
			step="1"
			placeholder={$page.data.t('general.year')}
			bind:value={rangeFrom}
		/>
	</div>
	<div class="flex flex-col gap-1">
		<label class="text-1-cond-bold" for="facet-range-to">{$page.data.t('general.to')}</label>
		<input
			id="facet-range-to"
			type="number"
			min="1000"
			max="2099"
			step="1"
			placeholder={$page.data.t('general.year')}
			bind:value={rangeTo}
		/>
	</div>
	<!-- todo: reusable button classes -->
	<button disabled={!rangeFrom && !rangeTo} class="button-primary" type="submit"
		>{$page.data.t('general.apply')}</button
	>

	{#each searchParams as [name, value]}
		{#if name !== '_q'}
			<input type="hidden" {name} {value} />
		{/if}
	{/each}
	<input type="hidden" name="_q" value={qOutput} />
</form>
