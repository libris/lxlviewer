<script lang="ts">
	import { page } from '$app/state';
	import popover from '$lib/actions/popover';
	import { myName, userSettings } from '$lib/utils/userSettings.svelte';
	import BiCheckSquareFill from '~icons/bi/check-square-fill';
	import BiSquare from '~icons/bi/square';

	const libraryValues = $derived(Object.values(userSettings.myLibraries));
	const sigelString = $derived(
		libraryValues.map((v) => `itemHeldBy:"sigel:${v.sigel}"`).join(' OR ')
	);

	const searchParams = $derived(new URLSearchParams(page.data.searchResult.first['@id']));
	const applyFilterUrl = $derived.by(() => {
		const paramsCopy = new URLSearchParams(searchParams);
		const q = paramsCopy.get('_q');
		paramsCopy.set('_q', `${q} ${sigelString}`);
		return decodeURIComponent(paramsCopy.toString());
	});

	//mutation?
	const removeFilterUrl = $derived(applyFilterUrl.replace(sigelString, ''));
	const isFilterActive = $derived(searchParams.get('_q')?.includes(sigelString));

	console.log(removeFilterUrl);
	console.log(applyFilterUrl);
	console.log(sigelString);

	const kb = {
		'@id': '1234',
		label: 'Kungliga bibiblioteket',
		sigel: 'S'
	};

	const gbg = {
		'@id': '6456456',
		label: 'Göteborg',
		sigel: 'Gbg'
	};

	let setName = $state('');

	function onclickSetName() {
		myName.setName(setName);
	}
</script>

{#snippet filterContent()}
	<div class="flex items-baseline gap-2">
		<span class="sr-only">{isFilterActive ? page.data.t('search.activeFilter') : ''}</span>
		<div class="flex h-[13px] w-[13px] rounded-sm bg-[white]" aria-hidden="true">
			{#if isFilterActive}
				<BiCheckSquareFill height="13px" />
			{:else}
				<BiSquare height="13px" />
			{/if}
		</div>
		<span class="text-3-cond-bold">{page.data.t('search.limitToLibraries')}</span>
	</div>
{/snippet}

<input bind:value={setName} />
<button onclick={onclickSetName}>sätt namn</button>
<p>{myName.is}</p>
<button onclick={() => userSettings.addLibrary(kb)}>Add S</button>
<button onclick={() => userSettings.removeLibrary(kb)}>Remove S</button>
<button onclick={() => userSettings.addLibrary(gbg)}>Add gbg</button>
<button onclick={() => userSettings.removeLibrary(gbg)}>Remove gbg</button>
<div class="flex w-full gap-2 rounded-sm bg-positive/40 p-3 md:flex-col md:gap-1">
	{#if libraryValues.length}
		<a class="no-underline" href={isFilterActive ? removeFilterUrl : applyFilterUrl}>
			{@render filterContent()}
		</a>
	{:else}
		<div
			class="cursor-not-allowed text-primary/64"
			use:popover={{
				title: page.data.t('search.noAddedLibrariesText'),
				placeAsSibling: true
			}}
		>
			{@render filterContent()}
		</div>
	{/if}
	<a class="self-end text-secondary text-2-regular" href="/my-page"
		>{page.data.t('search.addLibraries')}</a
	>
</div>
