<script lang="ts">
	import { page } from '$app/state';
	import popover from '$lib/actions/popover';
	import BiCheckSquareFill from '~icons/bi/check-square-fill';
	import BiSquare from '~icons/bi/square';

	let userHasFavouriteLibraries = $state(true);
	let filterIsActive = $derived(userHasFavouriteLibraries);
</script>

{#snippet filterContent()}
	<div class="flex items-baseline gap-2">
		<span class="sr-only">{filterIsActive ? page.data.t('search.activeFilter') : ''}</span>
		<div class="flex h-[13px] w-[13px] rounded-sm bg-[white]" aria-hidden="true">
			{#if filterIsActive}
				<BiCheckSquareFill height="13px" />
			{:else}
				<BiSquare height="13px" />
			{/if}
		</div>
		<span class="text-3-cond-bold">{page.data.t('search.limitToLibraries')}</span>
	</div>
{/snippet}

<div class="flex w-full gap-2 rounded-sm bg-positive/40 p-3 md:flex-col md:gap-1">
	{#if userHasFavouriteLibraries}
		<a class="no-underline" href="/">
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
