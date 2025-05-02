<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Link } from '$lib/types/xl';
	import BiSearch from '~icons/bi/search';

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

	afterNavigate(({ to }) => {
		if (to?.url) {
			_i = new URL(to.url).searchParams.get('_i')?.trim() || '';
		}
	});
</script>

<form action="" on:submit={handleSubmit} class="relative flex w-full gap-2 md:max-w-2xl">
	<label for="search-related" class="sr-only">{$page.data.t('search.relatedSearchLabel')}</label>
	<input
		class="bg-input h-9 w-full rounded-sm border border-neutral-300 pr-2 pl-8 text-xs"
		id="search-related"
		type="search"
		placeholder={$page.data.t('search.relatedSearchLabel')}
		bind:value={_i}
	/>
	<BiSearch class="text-subtle absolute top-0 left-2.5 h-9" />

	{#each searchParams as [name, value]}
		{#if name !== '_i' && name !== '_q'}
			<input type="hidden" {name} {value} />
		{/if}
	{/each}
	<input type="hidden" name="_i" value={_i} />
	<input type="hidden" name="_q" value={_i} />
</form>
