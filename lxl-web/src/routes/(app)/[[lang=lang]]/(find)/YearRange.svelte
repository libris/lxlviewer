<script lang="ts">
	import { page } from '$app/stores';

	let yearFrom: number | undefined;
	let yearTo: number | undefined;

	$: searchParams = Array.from($page.url.searchParams);
	$: _q = $page.url.searchParams.get('_q');
	$: qValue = getQ(yearFrom, yearTo);

	function getQ(from: number | undefined, to: number | undefined) {
		console.log('before', _q);
		if (!from && !to) {
			return _q;
		} else {
			let filterParams = _q?.split(' ').filter((param) => !param.startsWith('yearPublished'));
			let addParams = [
				...(filterParams ? filterParams : []),
				...(from ? [`yearPublished>=${from}`] : []),
				...(to ? [`yearPublished<=${to}`] : [])
			];
			console.log('after', addParams.join(' '));
			return addParams.join(' ');
		}
	}

	function handleSubmit(e: SubmitEvent) {
		if (!yearFrom && !yearTo) {
			e.preventDefault();
		}
	}
</script>

<form class="my-4 flex w-full items-end gap-4" action="find" on:submit={handleSubmit}>
	<div class="flex flex-1 gap-4">
		<div class="flex flex-1 flex-col">
			<label class="text-1-cond-bold" for="facet-year-from">Från</label>
			<input
				id="facet-year-from"
				type="number"
				min="1000"
				max="2099"
				step="1"
				placeholder="Årtal"
				bind:value={yearFrom}
			/>
		</div>
		<div class="flex flex-1 flex-col">
			<label class="text-1-cond-bold" for="facet-year-to">Till</label>
			<input
				id="facet-year-to"
				type="number"
				min="1000"
				max="2099"
				step="1"
				placeholder="Årtal"
				bind:value={yearTo}
			/>
		</div>
	</div>
	<!-- todo: reusable button classes -->
	<button
		disabled={!yearFrom && !yearTo}
		class="rounded-md px-4 py-2 text-primary-inv text-3-cond-bold gradient-primary hover:brightness-90 disabled:opacity-40 disabled:hover:brightness-100"
		type="submit">Applicera</button
	>

	{#each searchParams as [name, value]}
		{#if name !== '_q'}
			<input type="hidden" {name} {value} />
		{/if}
	{/each}
	<input type="hidden" name="_q" value={qValue} />
</form>
