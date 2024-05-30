<script lang="ts">
	import BiSearch from '~icons/bi/search';
	import { page } from '$app/stores';
	import type { Link } from '$lib/utils/xl';

	export let view: Link;

	let _i = $page.url.searchParams.get('_i')?.trim() || '';

	let url = new URL($page.url.origin + view['@id']);
	let searchParams = new URLSearchParams(url.search);
	searchParams.set('_sort', $page.url.searchParams.get('_sort')?.trim() || '');

	function handleSubmit() {
		if (!_i) {
			_i = '*';
		}
	}
</script>

<form action="" on:submit={handleSubmit} class="flex w-full max-w-xl gap-2">
	<label for="search-related" class="sr-only">{$page.data.t('search.RelatedSearchLabel')}</label>
	<input
		class="flex-1"
		id="search-related"
		type="search"
		placeholder={$page.data.t('search.RelatedSearchLabel')}
		bind:value={_i}
	/>
	<button class="button-primary" type="submit">
		<BiSearch fill="currentColor" aria-hidden="true" />
		<span class="sr-only sm:not-sr-only">{$page.data.t('search.search')}</span>
	</button>

	{#each searchParams as [name, value]}
		{#if name !== '_i' && name !== '_q'}
			<input type="hidden" {name} {value} />
		{/if}
	{/each}
	<input type="hidden" name="_i" value={_i} />
	<input type="hidden" name="_q" value={_i} />
</form>
