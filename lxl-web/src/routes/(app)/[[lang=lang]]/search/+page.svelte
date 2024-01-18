<script lang="ts">
	import { page } from '$app/stores';

	export let data;

	$: q = $page.url.searchParams.get('q');
</script>

<div class="m-3">
	<h1>{$page.data.t('search.result_info', { q: `${q}` })}</h1>
	<ul>
		{#each data.items as item (item['@id'])}
			<li><a class="underline" href={item.fnurgel}>{item.fnurgel}</a></li>
		{/each}
	</ul>
</div>
