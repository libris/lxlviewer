<script lang="ts">
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import type { FacetSearch } from './search';

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

<form class="my-4 flex w-full items-end gap-4" action="" on:submit={handleSubmit}>
	<div class="flex flex-1 gap-4">
		<div class="flex flex-1 flex-col">
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
		<div class="flex flex-1 flex-col">
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
	</div>
	<!-- todo: reusable button classes -->
	<button
		disabled={!rangeFrom && !rangeTo}
		class="rounded-md px-4 py-2 text-primary-inv text-3-cond-bold gradient-primary hover:brightness-90 disabled:opacity-40 disabled:hover:brightness-100"
		type="submit">{$page.data.t('general.apply')}</button
	>

	{#each searchParams as [name, value]}
		{#if name !== '_q'}
			<input type="hidden" {name} {value} />
		{/if}
	{/each}
	<input type="hidden" name="_q" value={qOutput} />
</form>
