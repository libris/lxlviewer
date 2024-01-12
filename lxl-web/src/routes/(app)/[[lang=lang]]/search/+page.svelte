<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';

	export let data: PageData;

	$: q = $page.url.searchParams.get('q');
</script>

<div class="m-3">
	<h1>{$page.data.t('search.result_info', { q: `${q}` })}</h1>
	<ul>
		{#each data.items as item (item['@id'])}
			<li><a class="underline" href={data.base + item.fnurgel}>{item.fnurgel}</a></li>
		{/each}
	</ul>
</div>
