<script lang="ts">
	import { getSelectionContext } from '#lib/contexts/selection.svelte.ts';
	import { getUserSettings } from '#lib/contexts/userSettings.ts';
	import BiCheckSquare from '~icons/bi/check2-square';

	const userSettings = getUserSettings();
	const selection = getSelectionContext();
	let selectableResults = $state(userSettings?.selectableResults);

	function toggleSelectableResults() {
		selectableResults = !selectableResults;
		userSettings.setSelectableResults(selectableResults);
		selection.clear();
	}
</script>

<button
	type="button"
	role="switch"
	aria-checked={!!selectableResults}
	class={['btn btn-primary size-8', selectableResults ? 'btn-accent' : '']}
	onclick={toggleSelectableResults}
	title="Visa valbara och numrerade träffar"
>
	<BiCheckSquare class="size-4" />
</button>
