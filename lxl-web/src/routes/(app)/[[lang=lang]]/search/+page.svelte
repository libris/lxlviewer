<script lang="ts">
	import { page } from '$app/stores';

	export let data;

	$: q = $page.url.searchParams.get('q');
</script>

<h1>Search results for: {q}</h1>
<ul>
	{#each data.items as item (item['@id'])}
		<li>{item['@id']}</li>
	{/each}
</ul>
