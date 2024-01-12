<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';

	export let data: PageData;

	$: q = $page.url.searchParams.get('q');
</script>

<h1>{$page.data.t('search.result_info', { values: { q: `${q}` } })}</h1>
<ul>
	{#each data.items as item (item['@id'])}
		<li>{item['@id']}</li>
	{/each}
</ul>
