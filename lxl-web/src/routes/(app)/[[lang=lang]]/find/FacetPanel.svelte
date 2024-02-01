<script lang="ts">
	import { page } from '$app/stores';
	import { type FacetGroup as Group } from './search';
	import FacetGroup from './FacetGroup.svelte';
	export let facets: Group[];
</script>

<div class="mr-4 w-2/12">
	{#each facets as group (group.dimension)}
		<FacetGroup {group} locale={$page.data.locale} />
	{/each}
</div>
