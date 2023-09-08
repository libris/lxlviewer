<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import Facet from './Facet.svelte';
	import FacetGroup from './FacetGroup.svelte';
	export let data: PageData;
	$: q = $page.url.searchParams.get('q')?.trim();
</script>

<main class="search-page">
	<div class="results">
		<h1 class="results-title">Sökresultat för: {q}</h1>
		<p class="results-count"><strong>{data.totalItems}</strong> träffar</p>
		{#if data.items}
			<ul class="results-list">
				{#each data.items as item (item.id)}
					<li class="results-list-item">
						<a href={`/${item.fnurgel}`}>
							<h2>{item.title}</h2>
						</a>
						{#if item.contributions}
							<ul class="contributions">
								{#each item.contributions as contribution (contribution.agent)}
									<li>
										<a href={contribution.fnurgel}> {contribution.agent}</a>
										{#if contribution.role}
											•
											<span>
												{Array.isArray(contribution.role)
													? contribution.role.join(', ')
													: contribution.role}
											</span>
										{/if}
									</li>
								{/each}
							</ul>
						{/if}
						{#if item.languages}
							<div class="language">
								{item.languages.join(', ')}
							</div>
						{/if}
						{#if item.instanceTypes}
							<ul>
								{#each Object.keys(item.instanceTypes) as key (key)}
									<li>
										{`${key}${item.instanceTypes[key] > 1 ? `(${item.instanceTypes[key]})` : ''}`}
									</li>
								{/each}
							</ul>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
		<div>Visar 1-10 av {data.totalItems} träffar</div>
	</div>
	<aside class="filters">
		{#if data.facetGroups && data.selectedFacets}
			<header class="filters-header">
				<h2 class="filters-title">Förfina urvalet</h2>
				<ul class="selected-facets">
					{#each data.selectedFacets as facet (facet.link)}
						<li>
							<Facet deletable={true} label={facet.label} link={facet.link} />
						</li>
					{/each}
				</ul>
			</header>
			{#if data.facetGroups}
				<ul class="facet-groups">
					{#each data.facetGroups as facetGroup (facetGroup.id)}
						<li>
							<FacetGroup data={facetGroup} />
						</li>
					{/each}
				</ul>
			{/if}
		{/if}
	</aside>
</main>

<style lang="scss">
	.filters {
		grid-area: filters;
		display: none;
		flex-direction: column;
		min-width: 0;
		position: sticky;
		top: var(--height-header);
		height: calc(100vh - var(--height-header));
		overflow-y: scroll;

		ul {
			list-style-type: none;
			padding: 0;
			margin: 0;
		}
	}

	.results {
		grid-area: results;
		padding: var(--padding-page);
		min-height: 100vh;
		min-width: 0;
	}

	.results-list {
		list-style-type: none;
		padding: 0;
		background: #fff;
		overflow: hidden;
		border-radius: 5px;
		border: 1px solid var(--color-border);
	}

	.results-list-item {
		padding: var(--padding-page);
		border-bottom: 1px solid var(--color-border);
		& h2 {
			font-size: inherit;
			margin: 0 0 0.25rem 0;
		}

		& .contributions {
			font-size: var(--font-size-small);
		}

		& .language {
			font-size: var(--font-size-small);
		}
	}
	.results-title {
		font-size: inherit;
		font-weight: inherit;
		margin: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.filters-header {
		position: sticky;
		top: 0;
		background: var(--color-background);
		padding: var(--padding-page) var(--padding-page) calc(var(--padding-page) / 2)
			var(--padding-page);
		z-index: 1;
	}

	.filters-title {
		font-size: inherit;
		font-weight: inherit;
		position: sticky;
		top: 0;
	}

	.selected-facets li {
		margin-bottom: 0.25rem;
	}

	.results-count {
		margin: 0;
		font-size: var(--font-size-small);
	}

	.contributions {
		list-style-type: none;
		padding: 0;
	}
	@media screen and (min-width: $layout-breakpoint-large) {
		.search-page {
			display: grid;
			grid-template-areas: 'filters results .';
			grid-template-columns: 1fr 2fr 1fr;
		}

		.filters {
			display: flex;
			min-width: 0;
		}

		.results {
			width: 100%;
			max-width: 960px;
			box-sizing: border-box;
			margin: 0 auto;
		}
	}
</style>
