<script lang="ts">
	import { page } from '$app/state';
	import type { HeldByMyLibraries } from '$lib/types/holdings';
	import popover from '$lib/actions/popover';
	import BiHouseHeart from '~icons/bi/house-heart';

	type IndicatorProps = {
		libraries: HeldByMyLibraries;
	};
	const { libraries }: IndicatorProps = $props();
	const librariesString = $derived(
		Object.values(libraries)
			.map((v) => (typeof v === 'string' ? v : v.label))
			.join(', ')
	);
</script>

<span
	use:popover={{
		title: `${page.data.t('holdings.availableAt')}: ${librariesString}`
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
