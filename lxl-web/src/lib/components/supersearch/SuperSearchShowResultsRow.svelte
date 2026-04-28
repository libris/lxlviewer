<script lang="ts">
	import { page } from '$app/state';
	import { getSearchContext } from '$lib/contexts/search';
	import Spinner from '$lib/components/Spinner.svelte';
	import IconSearch from '~icons/bi/search';

	type Props = {
		rowIndex: number;
		getCellId: (rowIndex: number, cellIndex: number) => string | undefined;
		isFocusedRow: (rowIndex: number) => boolean | undefined;
		isFocusedCell: (rowIndex: number, cellIndex: number) => boolean | undefined;
		isLoading: boolean | undefined;
	};

	let { rowIndex, getCellId, isFocusedRow, isFocusedCell, isLoading }: Props = $props();

	const searchContext = getSearchContext();
</script>

<div role="row" class={[isFocusedRow(rowIndex) && 'focused-row']}>
	<button
		type="submit"
		id={getCellId(rowIndex, 0)}
		class={[
			'flex h-12 w-full px-0.75 sm:px-2 lg:px-3',
			isFocusedCell(rowIndex, 0) && 'focused-cell'
		]}
		onclick={() => searchContext.hideExpandedSearch()}
	>
		<div class={['text-link flex items-center whitespace-nowrap']}>
			<div class="flex size-11 items-center justify-center">
				<IconSearch aria-hidden="true" class="size-4.5" />
			</div>

			{page.data.t('supersearch.showResults')}
			{#if isLoading}
				<div class="ml-4 h-5 w-5">
					<Spinner />
				</div>
			{/if}
		</div>
	</button>
</div>
