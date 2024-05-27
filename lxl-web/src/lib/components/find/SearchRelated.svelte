<script lang="ts">
	import { page } from '$app/stores';
	import getDefaultSearchParams from '$lib/utils/addDefaultSearchParams';
	import getSortedSearchParams from '$lib/utils/getSortedSearchParams';

	let q = $page.url.searchParams.get('_i')?.trim();
	let searchParams = getSortedSearchParams(getDefaultSearchParams($page.url.searchParams));

	function handleSubmit(e: SubmitEvent) {
		if (!q) {
			e.preventDefault();
			alert('preventing!');
		}
	}
</script>

<form action="" on:submit={handleSubmit}>
	<label for="search-related" class="sr-only">{$page.data.t('search.RelatedSearchLabel')}</label>
	<input
		id="search-related"
		type="search"
		placeholder={$page.data.t('search.RelatedSearchLabel')}
		bind:value={q}
	/>

	{#each searchParams as [name, value]}
		<input type="hidden" {name} {value} />
	{/each}
</form>
