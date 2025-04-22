<script lang="ts">
	import { page } from '$app/state';
	import popover from '$lib/actions/popover';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import BiCheckSquareFill from '~icons/bi/check-square-fill';
	import BiSquare from '~icons/bi/square';

	const libraryValues = $derived(Object.values(getUserSettings()?.myLibraries || {}));

	const sigelString = $derived.by(() => {
		const sigelMap = libraryValues.map((v) => `itemHeldBy:"sigel:${v.sigel}"`).join(' OR ');
		return libraryValues.length > 1 ? sigelMap.replace(/^/, '(').replace(/$/, ')') : sigelMap;
	});

	const searchParams = $derived(new URLSearchParams(page.data.searchResult.first['@id']));

	const applyFilterUrl = $derived.by(() => {
		const paramsCopy = new URLSearchParams(searchParams);
		const q = paramsCopy.get('_q');
		paramsCopy.set('_q', `${q} ${sigelString}`);
		// 'replace' is a hack to get around the fact that...
		// to get this working on fnurgel pages, we need to modify o & p-links from the response
		// that are *partially* encoded. Can't preserve that encoding using built in methods
		return decodeURIComponent(paramsCopy.toString()).replace('#', '%23');
	});

	const removeFilterUrl = $derived.by(() => {
		const paramsCopy = new URLSearchParams(searchParams);
		const q = paramsCopy.get('_q');
		const newQ = q?.replaceAll(sigelString, '') || '*';
		paramsCopy.set('_q', newQ);
		return decodeURIComponent(paramsCopy.toString()).replace('#', '%23');
	});

	const isFilterActive = $derived(
		libraryValues.length && searchParams.get('_q')?.toString().includes(sigelString)
	);
</script>

{#snippet filterContent()}
	<div class="flex items-baseline gap-2">
		<span class="sr-only">{isFilterActive ? page.data.t('search.activeFilter') : ''}</span>
		<div
			class={[
				'flex h-[13px] w-[13px] rounded-sm bg-[white]'
				// !libraryValues.length && 'text-primary/24'
			]}
			aria-hidden="true"
		>
			{#if isFilterActive}
				<BiCheckSquareFill height="13px" />
			{:else}
				<BiSquare height="13px" />
			{/if}
		</div>
		<span>{page.data.t('search.limitToLibraries')}</span>
	</div>
{/snippet}

<div class="flex w-full gap-2 rounded-sm p-3 md:flex-col md:gap-1">
	{#if libraryValues.length}
		<a class="no-underline" href={isFilterActive ? removeFilterUrl : applyFilterUrl}>
			{@render filterContent()}
		</a>
	{:else}
		<div
			class="cursor-not-allowed"
			use:popover={{
				title: page.data.t('search.noAddedLibrariesText'),
				placeAsSibling: true
			}}
		>
			{@render filterContent()}
		</div>
	{/if}
	<a class="self-end" href="/my-pages"
		>{libraryValues.length
			? page.data.t('search.changeLibraries')
			: page.data.t('search.addLibraries')}</a
	>
</div>
