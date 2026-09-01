<script lang="ts">
	import IconSearch from '~icons/bi/search';
	import Spinner from '$lib/components/Spinner.svelte';
	import { page } from '$app/state';
	import IconReturnKey from '~icons/bi/arrow-return-left';

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
		'flex items-center sm:mx-2 rounded-lg lg:mx-3 mt-1 lg:mt-0 max-sm:w-full sm:relative z-999 sm:z-0 bg-page px-1 pb-1 sm:px-0',
		isFocusedRow(rowIndex) && 'focused-row'
	]}
>
	<button
		type="submit"
		id={getCellId(rowIndex, 0)}
		class={[
			'flex min-h-11 2xl:min-h-12 w-full items-center hover:underline rounded-lg justify-start text-link',
			(isFocusedCell(rowIndex, 0) || skipShowAllResultsRowOnArrowKey) && 'focused-cell',
			skipShowAllResultsRowOnArrowKey && 'outline-transparent! max-sm:bg-transparent!'
		]}
	>
		<span class={['flex items-center gap-2 lg:gap-2.5 font-medium']}>
			<span class="size-6 items-center justify-center flex mr-1.5 ml-3">
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
	{#if isFocusedCell(rowIndex, 0)}
		<IconReturnKey
			class="hidden sm:block absolute right-4.5 text-link pointer-events-none"
			aria-hidden="true"
		/>
	{/if}
</div>
