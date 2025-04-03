<script lang="ts">
	import popover from '$lib/actions/popover';
	import type { LibraryItem } from '$lib/types/userSettings';
	import BiHouseHeart from '~icons/bi/house-heart';

	type IndicatorProps = {
		libraries: LibraryItem[];
	};
	const { libraries }: IndicatorProps = $props();
	const librariesString = $derived(libraries.map((lib) => lib.label).join(', '));
</script>

<span
	class="relative p-2 text-positive sm:text-lg md:text-xl"
	use:popover={{
		title: `Finns på ditt bibliotek: ${librariesString}`
	}}
>
	<BiHouseHeart />
</span>
