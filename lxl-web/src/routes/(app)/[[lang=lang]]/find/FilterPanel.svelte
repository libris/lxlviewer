<script lang="ts">
	import { page } from '$app/stores';
	import { type FacetGroup } from './search';
	import Filter from './Filter.svelte';
	export let facets: FacetGroup[];
</script>

<div class="mr-4 w-2/12">
	{#each facets as group (group.dimension)}
		<Filter {group} locale={$page.data.locale} />
	{/each}
</div>
