<script lang="ts">
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';

	let yearFrom: number | undefined = getQValue('yearPublished>=');
	let yearTo: number | undefined = getQValue('yearPublished<=');

	function getQValue(param: string) {
		// extract current values from q to populate input on load
		let found = $page.url.searchParams
			.get('_q')
			?.split(' ')
			.find((p) => p.startsWith(param))
			?.replace(param, '');
		return found && !isNaN(parseInt(found)) ? parseInt(found) : undefined;
	}

	afterNavigate(() => {
		yearFrom = getQValue('yearPublished>=');
		yearTo = getQValue('yearPublished<=');
	});

	$: searchParams = Array.from($page.url.searchParams);
	$: _q = $page.url.searchParams.get('_q');
	$: _qWithoutYear = (() =>
		_q?.split(' ').filter((param, i, arr) => {
			if (['or', 'not'].includes(param.toLowerCase()) && arr?.[i + 1].includes('yearPublished')) {
				// remove operators preceding a yearPublished
				return false;
			}
			if (param.includes('yearPublished')) {
				// remove yearPublished
				return false;
			}
			return true;
		}))();

	$: qOutput = getQOutput(yearFrom, yearTo);

	function getQOutput(from: number | undefined, to: number | undefined) {
		console.log('before', _q);
		if (!from && !to) {
			return _q;
		} else {
			let addParams = [
				...(_qWithoutYear ? _qWithoutYear : []),
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

<form class="my-4 flex w-full items-end gap-4" action="" on:submit={handleSubmit}>
	<div class="flex flex-1 gap-4">
		<div class="flex flex-1 flex-col">
			<label class="text-1-cond-bold" for="facet-year-from">{$page.data.t('general.from')}</label>
			<input
				id="facet-year-from"
				type="number"
				min="1000"
				max="2099"
				step="1"
				placeholder={$page.data.t('general.year')}
				bind:value={yearFrom}
			/>
		</div>
		<div class="flex flex-1 flex-col">
			<label class="text-1-cond-bold" for="facet-year-to">{$page.data.t('general.to')}</label>
			<input
				id="facet-year-to"
				type="number"
				min="1000"
				max="2099"
				step="1"
				placeholder={$page.data.t('general.year')}
				bind:value={yearTo}
			/>
		</div>
	</div>
	<!-- todo: reusable button classes -->
	<button
		disabled={!yearFrom && !yearTo}
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
