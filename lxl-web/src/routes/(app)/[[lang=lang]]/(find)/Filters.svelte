<script lang="ts">
	import { page } from '$app/stores';
	export let facets: unknown;
	import FacetGroup from './FacetGroup.svelte';
	import SearchMapping from './SearchMapping.svelte';

	let searchPhrase = '';
</script>

<div class="flex flex-col">
	{#if facets && facets.length > 0}
		<nav
			class="active-filters md:none overflow-hidden whitespace-nowrap py-2"
			aria-label="Valda filter"
		>
			<SearchMapping mapping={$page.data.searchResult.mapping} />
		</nav>
		<nav class="flex flex-col px-4">
			<input
				bind:value={searchPhrase}
				placeholder={$page.data.t('search.findFilter')}
				title={$page.data.t('search.findFilter')}
				class="w-full"
				type="search"
			/>
			<ol>
				{#each facets as group (group.dimension)}
					<FacetGroup {group} locale={$page.data.locale} {searchPhrase} />
				{/each}
			</ol>
		</nav>
	{/if}
</div>

<style lang="postcss">
	.active-filters {
		position: relative;
		&::after {
			content: '';
			position: absolute;
			top: 0;
			right: 0;
			width: 44px;
			height: 100%;
			background: red;
			z-index: 100;
			pointer-events: none;
			background: linear-gradient(to right, rgba(247, 246, 242, 0), rgba(247, 246, 242, 1));
		}

		& > :global(*) {
			padding-right: 44px;
		}
	}
</style>
