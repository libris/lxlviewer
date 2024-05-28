<script lang="ts">
	import { page } from '$app/stores';
	import getDefaultSearchParams from '$lib/utils/addDefaultSearchParams';
	import getSortedSearchParams from '$lib/utils/getSortedSearchParams';

	export let predicate;

	let _i = $page.url.searchParams.get('_i')?.trim();
	let searchParams = getSortedSearchParams(getDefaultSearchParams($page.url.searchParams));

	searchParams.delete('_offset');
	console.log(predicate);
	// todo: iterate predicate

	function handleSubmit(e: SubmitEvent) {
		if (!_i) {
			e.preventDefault();
		}
	}
</script>

<form action="" on:submit={handleSubmit} class="flex gap-2">
	<label for="search-related" class="sr-only">{$page.data.t('search.RelatedSearchLabel')}</label>
	<input
		id="search-related"
		type="search"
		placeholder={$page.data.t('search.RelatedSearchLabel')}
		bind:value={_i}
	/>
	<button class="button-primary" type="submit">{$page.data.t('search.search')}</button>

	{#each searchParams as [name, value]}
		{#if name !== '_i' && name !== '_q'}
			<input type="hidden" {name} {value} />
		{/if}
	{/each}
	<input type="hidden" name="_i" value={_i} />
	<input type="hidden" name="_q" value={_i} />
</form>
