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
		'text-subtle flex items-center sm:mx-3  sm:rounded-lg',
		isFocusedRow(rowIndex) && 'focused-row'
	]}
>
	<button
		type="submit"
		id={getCellId(rowIndex, 0)}
		class={[
			'flex min-h-12 w-full items-center 2xl:min-h-13 hover:underline sm:rounded-lg',
			(isFocusedCell(rowIndex, 0) || skipShowAllResultsRowOnArrowKey) && 'focused-cell',
			skipShowAllResultsRowOnArrowKey && 'outline-transparent!'
		]}
	>
		<span class={['flex items-center gap-2 lg:gap-2.5 text-link font-medium']}>
			<span class="size-6 items-center justify-center flex ml-4 mr-3 sm:ml-3 sm:mr-1.5">
				<IconSearch aria-hidden="true" class="inline-flex size-4.5 text-link" />
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
