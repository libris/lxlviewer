<script lang="ts">
	import { page } from '$app/state';
	import popover from '$lib/actions/popover';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import BiHouseHeart from '~icons/bi/house-heart';

	type IndicatorProps = {
		libraries: string[];
	};
	const { libraries }: IndicatorProps = $props();
	const { myLibraries } = getUserSettings();

	function getIndicatorText() {
		if (myLibraries) {
			return libraries.map((lib) => myLibraries[lib] || '').join(', ');
		}
		return '';
	}
</script>

<span
	use:popover={{
		title: `${page.data.t('holdings.availableAt')}: ${getIndicatorText()}`
	}}
>
	<BiHouseHeart class="libraries-indicator" />
</span>

<style>
	:global(.libraries-indicator) {
		color: var(--color-primary-700);
	}

	:global(.btn-cta .libraries-indicator) {
		color: var(--color-primary-50);
	}
</style>
