<script lang="ts">
	import { getSelectionContext } from '#lib/contexts/selection.svelte.ts';
	import { getUserSettings } from '#lib/contexts/userSettings.ts';
	import BiToggleOff from '~icons/bi/toggle-off';
	import BiToggleOn from '~icons/bi/toggle-on';

	const userSettings = getUserSettings();
	const selection = getSelectionContext();
	let selectableResults = $state(userSettings?.selectableResults);

	const ToggleComponent = $derived(selectableResults ? BiToggleOn : BiToggleOff);

	function toggleSelectableResults() {
		selectableResults = !selectableResults;
		userSettings.setSelectableResults(selectableResults);
		selection.clear();
	}
</script>

<button
	type="button"
	role="switch"
	aria-checked={selectableResults}
	class="btn btn-ghost h-4 gap-2 text-sm sm:text-xs"
	onclick={toggleSelectableResults}
>
	<span>Skapa urval</span>
	<ToggleComponent
		aria-hidden="true"
		class={['text-2xl', selectableResults ? 'text-accent' : 'text-subtle']}
	/>
</button>
