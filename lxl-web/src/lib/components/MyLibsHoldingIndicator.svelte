<script lang="ts">
	import { page } from '$app/state';
	import type { LibraryItem } from '$lib/types/userSettings';
	import popover from '$lib/actions/popover';
	import BiHouseHeart from '~icons/bi/house-heart';

	type IndicatorProps = {
		libraries: LibraryItem[];
	};
	const { libraries }: IndicatorProps = $props();
	const librariesString = $derived(libraries.map((lib) => lib.label).join(', '));
</script>

<span
	use:popover={{
		title: `${page.data.t('holdings.availableAt')}: ${librariesString}`
	}}
>
	<BiHouseHeart class="text-primary-700" />
</span>
