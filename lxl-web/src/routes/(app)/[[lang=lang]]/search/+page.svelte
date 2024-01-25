<script lang="ts">
	import { page } from '$app/stores';
	import DecoratedData from '$lib/components/DecoratedData.svelte';

	export let data;

	$: q = $page.url.searchParams.get('q');
</script>

<div class="m-3">
	<h1>{$page.data.t('search.result_info', { q: `${q}` })}</h1>
	<ul>
		{#each data.searchResult.items as item (item['@id'])}
			href={item.fnurgel}>{item['@id']}
			<li>
				<DecoratedData data={item} />
			</li>
		{/each}
	</ul>
	<ul>
		{#each data.searchResult.facetGroups as group (group.dimension)}
			<h2>{group.label}</h2>
			<br />

			{#each group.facets as facet (facet.view)}
				<a class="underline" href={facet.view['@id']}>
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
