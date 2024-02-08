<script lang="ts">
	import { page } from '$app/stores';
	import { type FacetGroup as Group } from './search';
	import FacetGroup from './FacetGroup.svelte';
	export let facets: Group[];
</script>

<nav aria-labelledby="facet-sidebar-header">
	<header id="facet-sidebar-header" class="text-2-cond-bold">Filter</header>
	<ol>
		{#each facets as group (group.dimension)}
			<FacetGroup {group} locale={$page.data.locale} />
		{/each}
	</ol>
</nav>
