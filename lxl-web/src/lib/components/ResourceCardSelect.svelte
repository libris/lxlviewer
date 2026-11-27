<script lang="ts">
	import { getSelectionContext } from '#lib/contexts/selection.svelte.ts';
	import type { DisplayMode } from '#lib/types/userSettings.ts';

	type Props = {
		id: string;
		itemNo?: number;
		titleId: string;
		variant?: DisplayMode;
	};

	let { id, itemNo = undefined, titleId, variant = 'default' }: Props = $props();

	const selection = getSelectionContext();
	let isSelected = $derived(selection.isSelected(id));
</script>

<div
	class={[
		'card-select flex items-start justify-start gap-0.5',
		variant === 'default' && 'flex-col md:pl-1',
		variant === 'gallery' && 'items-center my-0.5 gap-1'
	]}
>
	<label
		for={`selection-${id}`}
		class={['text-xs text-subtle', !itemNo && 'sr-only']}
		aria-labelledby={`selection-label-${id} ${titleId}`}
	>
		<span id={`selection-label-${id}`}>
			{itemNo && itemNo.toLocaleString() + '.'}
		</span>
	</label>
	<input
		type="checkbox"
		id={`selection-${id}`}
		checked={isSelected}
		onchange={() => selection.toggle(id)}
		disabled={selection.limitReached && !isSelected}
	/>
</div>

<style>
	.card-select {
		grid-area: select;
	}
</style>
