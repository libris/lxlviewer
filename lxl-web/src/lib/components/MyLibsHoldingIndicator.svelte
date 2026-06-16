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

	const indicatorText = $derived.by(() => {
		if (myLibraries) {
			return (
				page.data.t('holdings.availableAt') +
				': ' +
				libraries.map((lib) => myLibraries[lib] || '').join(', ')
			);
		}
		return '';
	});
</script>

<span
	aria-label={indicatorText}
	use:popover={{
		title: indicatorText
	}}
>
	<BiHouseHeart aria-hidden="true" class="libraries-indicator" />
</span>

<style>
	:global(.libraries-indicator) {
		color: var(--color-primary-700);
	}

	:global(.btn-cta .libraries-indicator) {
		color: var(--color-primary-50);
	}
</style>
