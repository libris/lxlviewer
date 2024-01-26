<script lang="ts">
	import { page } from '$app/stores';
	import DecoratedData from '$lib/components/DecoratedData.svelte';

	export let data;

	$: q = $page.url.searchParams.get('q');
</script>

<div class="m-3">
	<h1 class="text-6-cond-extrabold">{$page.data.t('search.result_info', { q: `${q}` })}</h1>
	<ul>
		{#each data.searchResult.mapping as mapping}
			<li>
				<DecoratedData data={mapping.display} />
				{#if 'up' in mapping}
					<a class="underline" href={mapping.up['@id']}>x</a>
				{/if}
			</li>
		{/each}
	</ul>
	<br />
	<br />
	<ul>
		{#each data.searchResult.items as item (item['@id'])}
			<li>
				<DecoratedData data={item} />
			</li>
			<br />
		{/each}
	</ul>
	<br />
	<br />
	<ul>
		{#each data.searchResult.facetGroups as group (group.dimension)}
			<h2 class="text-5-cond-extrabold">{group.label}</h2>
			<br />

			{#each group.facets as facet (facet.view)}
				<a href={facet.view['@id']}>
					<DecoratedData data={facet.object} />
				</a>
				<pre>{JSON.stringify(facet)}</pre>
				<br />
			{/each}

			<br />
			<br />
		{/each}
	</ul>
</div>
