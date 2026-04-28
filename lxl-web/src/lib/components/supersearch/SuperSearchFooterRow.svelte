<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import IconArrowUpKey from '~icons/bi/arrow-up-short';
	import IconArrowDownKey from '~icons/bi/arrow-right-short';
	import IconArrowLeftKey from '~icons/bi/arrow-left-short';
	import IconArrowRightKey from '~icons/bi/arrow-right-short';
	import IconReturnKey from '~icons/bi/arrow-return-left';

	type Props = {
		inputRowIndex: number;
		qualifiersRowIndex: number;
		showResultsRowIndex: number;
		footerRowIndex: number;
		getCellId: (rowIndex: number, cellIndex: number) => string | undefined;
		isFocusedRow: (rowIndex: number) => boolean | undefined;
		isFocusedCell: (rowIndex: number, cellIndex: number) => boolean | undefined;
	};

	let {
		inputRowIndex,
		qualifiersRowIndex,
		showResultsRowIndex,
		footerRowIndex,
		getCellId,
		isFocusedRow,
		isFocusedCell
	}: Props = $props();

	/* The return key label is context-aware depending on what the user has focused */
	const returnKeyLabel = $derived.by(() => {
		if (isFocusedCell(inputRowIndex, 1)) {
			return page.data.t('supersearch.clear');
		}
		if (isFocusedRow(inputRowIndex) || isFocusedRow(showResultsRowIndex)) {
			return page.data.t('supersearch.search');
		}
		if (isFocusedRow(qualifiersRowIndex)) {
			return page.data.t('supersearch.add');
		}
		return page.data.t('supersearch.select');
	});
</script>

<div
	role="row"
	data-skip-row-on-arrow-key
	class="border-neutral flex min-h-14 items-center justify-between gap-4 pl-4 text-sm sm:border-t"
>
	<ul class="text-placeholder hidden cursor-default items-center gap-4 sm:flex">
		<li>
			<kbd class="key" title={page.data.t('supersearch.arrowUpKey')}>
				<IconArrowUpKey class="absolute size-4" aria-hidden="true" />
				<span class="text-transparent">↑</span>
			</kbd>
			<kbd class="key" title={page.data.t('supersearch.arrowDownKey')}>
				<IconArrowDownKey class="absolute size-4" aria-hidden="true" />
				<span class="text-transparent">↓</span>
			</kbd>
			<kbd class="key" title={page.data.t('supersearch.arrowLeftKey')}>
				<IconArrowLeftKey class="absolute size-4" aria-hidden="true" />
				<span class="text-transparent">←</span>
			</kbd>
			<kbd class="key" title={page.data.t('supersearch.arrowRightKey')}>
				<IconArrowRightKey class="absolute size-4" aria-hidden="true" />
				<span class="text-transparent">→</span>
			</kbd>
			{page.data.t('supersearch.navigate')}
		</li>
		<li>
			<kbd class="key" title={page.data.t('supersearch.returnKey')}>
				<IconReturnKey class="absolute mt-0.5 size-3" aria-hidden="true" />
				<span class="text-transparent">↵</span>
			</kbd>
			<span data-testid="supersearch-return-key-label">{returnKeyLabel}</span>
		</li>
	</ul>
	<a
		href={resolve(page.data.localizeHref('/help'))}
		id={getCellId(footerRowIndex, 0)}
		class={[
			'text-link mr-4 justify-end hover:underline',
			isFocusedCell(footerRowIndex, 0) && 'underline outline-2 -outline-offset-2'
		]}
	>
		{page.data.t('supersearch.searchHelp')}
	</a>
</div>
