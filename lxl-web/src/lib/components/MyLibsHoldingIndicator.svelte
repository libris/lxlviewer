<script lang="ts">
	import { page } from '$app/state';
	import type { MyLibrariesType } from '$lib/types/userSettings';
	import popover from '$lib/actions/popover';
	import BiHouseHeart from '~icons/bi/house-heart';

	type IndicatorProps = {
		libraries: MyLibrariesType[];
	};
	const { libraries }: IndicatorProps = $props();
	const librariesString = $derived(libraries.map((lib) => lib.label).join(', '));
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
