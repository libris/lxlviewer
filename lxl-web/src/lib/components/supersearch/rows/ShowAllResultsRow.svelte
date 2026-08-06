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
		skipShowAllResultsRowOnArrowKey: boolean;
	};

	let {
		rowIndex,
		getCellId,
		isFocusedRow,
		isFocusedCell,
		isLoading,
		skipShowAllResultsRowOnArrowKey
	}: Props = $props();
</script>

<div
	role="row"
	class={[
		' flex items-center sm:mx-3 sm:rounded-lg fixed bottom-0 max-sm:w-full sm:static z-999 bg-page pb-3 px-3 sm:pb-0 sm:px-0',
		isFocusedRow(rowIndex) && 'focused-row'
	]}
>
	<button
		type="submit"
		id={getCellId(rowIndex, 0)}
		class={[
			'flex min-h-12 w-full items-center 2xl:min-h-13 hover:underline rounded-full sm:rounded-lg justify-center sm:justify-start text-link! max-sm:bg-accent-50 max-sm:hover:bg-link max-sm:hover:text-page!',
			(isFocusedCell(rowIndex, 0) || skipShowAllResultsRowOnArrowKey) &&
				'focused-cell max-sm:bg-link! max-sm:text-page!',
			skipShowAllResultsRowOnArrowKey && 'outline-transparent!'
		]}
	>
		<span class={['flex items-center gap-2 lg:gap-2.5 font-medium']}>
			<span class="size-6 items-center justify-center flex mr-1.5 sm:ml-3">
				<IconSearch aria-hidden="true" class="inline-flex size-4.5" />
			</span>
			{page.data.t('supersearch.showAll')}
		</span>
		{#if isLoading}
			<div class="hidden sm:inline ml-3 h-5 w-5">
				<Spinner />
			</div>
		{/if}
	</button>
</div>
