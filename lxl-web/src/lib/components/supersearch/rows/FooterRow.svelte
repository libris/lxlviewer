<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	type Props = {
		footerRowIndex: number;
		getCellId: (rowIndex: number, cellIndex: number) => string | undefined;
		isFocusedCell: (rowIndex: number, cellIndex: number) => boolean | undefined;
	};

	let { footerRowIndex, getCellId, isFocusedCell }: Props = $props();
</script>

<div
	role="row"
	data-skip-row-on-arrow-key
	class="border-neutral flex min-h-12 items-center justify-end gap-4 pl-2 text-sm sm:border-t sm:pl-4 bg-transparent!"
>
	<a
		href={resolve(page.data.localizeHref('/help'))}
		id={getCellId(footerRowIndex, 0)}
		class={[
			'text-link mr-4 justify-end hover:underline hover:text-link',
			isFocusedCell(footerRowIndex, 0) &&
				'underline outline-2 -outline-offset-2 outline-outline text-link'
		]}
	>
		{page.data.t('supersearch.searchHelp')}
	</a>
</div>
