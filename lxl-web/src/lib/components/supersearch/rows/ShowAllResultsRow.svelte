<script lang="ts">
	import IconSearch from '~icons/bi/search';
	import Spinner from '$lib/components/Spinner.svelte';
	import { page } from '$app/state';

	type Props = {
		rowIndex: number;
		getCellId: (rowIndex: number, cellIndex: number) => string | undefined;
		isFocusedRow: (rowIndex: number) => boolean | undefined;
		isFocusedCell: (rowIndex: number, cellIndex: number) => boolean | undefined;
		isLoading: boolean | undefined;
		resultsCount: number | undefined;
	};

	let { rowIndex, getCellId, isFocusedRow, isFocusedCell, isLoading, resultsCount }: Props =
		$props();
</script>

<div
	role="row"
	class={['text-subtle flex items-center text-sm', isFocusedRow(rowIndex) && 'focused-row']}
>
	<h2 id="supersearch-results-label" aria-live="polite" class="sr-only font-medium">
		<span class="sr-only">{resultsCount}</span>
		{page.data.t('supersearch.suggestions')}
	</h2>
	<button
		type="submit"
		id={getCellId(rowIndex, 0)}
		class={[
			'flex min-h-12 w-full items-center px-2 hover:underline sm:px-4',
			isFocusedCell(rowIndex, 0) && 'focused-cell'
		]}
	>
		<span class={['text-link flex items-center gap-2 lg:flex-row-reverse lg:gap-2.5']}>
			{page.data.t('supersearch.showAll')}
			<IconSearch aria-hidden="true" class="text-link size-4" />
		</span>
		{#if isLoading}
			<div class="ml-3 h-5 w-5">
				<Spinner />
			</div>
		{/if}
	</button>
</div>
