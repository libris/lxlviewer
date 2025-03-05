<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import { SuperSearch } from 'supersearch';
	import { page } from '$app/stores';
	import BiSearch from '~icons/bi/search';
	import { lxlQuery } from 'codemirror-lang-lxlquery';
	import BiXLg from '~icons/bi/x-lg';
	import BiArrowLeft from '~icons/bi/arrow-left';
	import SuggestionCard from '$lib/components/SuggestionCard.svelte';

	let searchPhrase = $state('');
	let value = $state('');
	let superSearch = $state<ReturnType<typeof SuperSearch>>();

	let isLoading: boolean | undefined = $state();
	let hasData: boolean | undefined = $state();
	let placeholder = $state('Search');
	let useFormAttribute = $state(false);
</script>

<svelte:head>
	<title>{getPageTitle($page.data.t('header.myPages'))}</title>
</svelte:head>

<div class="container-fluid mb-12 mt-8 max-w-3xl page-padding">
	<h1 class="mb-6 pl-2 text-6-cond-extrabold">Mina sidor</h1>
	<h1 class="mb-2 pl-2 text-3-cond-bold">Bibliotek</h1>
	<div class="container-fluid max-w-3xl rounded-md bg-primary/4 page-padding">
		Hitta och lägg till favoritbibliotek
		<div class="relative">
			<BiSearch class="absolute left-2.5 top-6 text-sm text-icon" />
			<input
				bind:value={searchPhrase}
				placeholder={$page.data.t('myPages.findLibrary')}
				aria-label={$page.data.t('myPages.findLibrary')}
				class="mt-3 w-full pl-8"
				type="search"
			/>
			<SuperSearch
				name="q"
				bind:this={superSearch}
				bind:value
				bind:isLoading
				bind:hasData
				{placeholder}
				endpoint={`/api/my-pages`}
				queryFn={(query) =>
					new URLSearchParams({
						_q: query,
						_limit: '10'
					})}
				language={lxlQuery}
				toggleWithKeyboardShortcut
				defaultInputCol={2}
				defaultResultRow={1}
				form={useFormAttribute ? 'form-outside' : undefined}
			>
				{#snippet loadingIndicator()}
					<div class="flex min-h-11 w-full items-center px-4 text-left">
						{$page.data.t('search.loading')}
					</div>
				{/snippet}
				{#snippet inputRow({
					expanded,
					inputField,
					getCellId,
					isFocusedCell,
					onclickSubmit,
					onclickClear,
					onclickClose
				})}
					<div class="supersearch-input">
						{#if expanded}
							<button
								type="button"
								id={getCellId(0)}
								class:focused-cell={isFocusedCell(0)}
								aria-label={$page.data.t('general.close')}
								class="button-ghost min-h-12 min-w-11 rounded-none border-none hover:bg-main sm:hidden"
								onclick={onclickClose}
							>
								<BiArrowLeft />
							</button>
						{/if}
						<div class="flex-1 overflow-hidden">
							{@render inputField()}
						</div>
						{#if searchPhrase}
							<button
								type="reset"
								id={getCellId(1)}
								class:focused-cell={isFocusedCell(1)}
								class="button-ghost min-h-12 rounded-none border-none hover:bg-main"
								aria-label={$page.data.t('search.clearFilters')}
								onclick={onclickClear}
							>
								<BiXLg />
							</button>
						{/if}
						<button
							type="submit"
							id={getCellId(2)}
							class:focused-cell={isFocusedCell(2)}
							class="submit-action button-primary min-h-12 rounded-none"
							enterkeyhint="search"
							onclick={onclickSubmit}
						>
							{$page.data.t('search.search')}
						</button>
					</div>
				{/snippet}
				{#snippet resultItemRow({ resultItem, getCellId, isFocusedCell })}
					{#if resultItem}
						<div class="suggestion-card-container flex text-xs md:text-sm">
							<SuggestionCard
								item={resultItem}
								cellId={getCellId(0)}
								isFocused={isFocusedCell(0)}
							/>
						</div>
					{/if}
				{/snippet}
			</SuperSearch>

			<!--			return new URLSearchParams({-->
			<!--			_q: query,-->
			<!--			_limit: '8',-->
			<!--			cursor: cursor.toString()-->
			<!--			https://libris.kb.se/find.jsonld?q=kung&_lens=chips&_suggest=sv&_limit=7&@type=Library-->
			<!--			https://beta.libris-qa.kb.se/find?_i=&_q=typ:Library&_limit=20&_spell=true-->
		</div>
	</div>
</div>

<style lang="postcss">
	/* codemirror elements */

	:global(.codemirror-container) {
		@apply block flex-1;
	}

	:global(.codemirror-container .cm-scroller) {
		@apply min-h-12 font-sans outline-none text-3-regular;
		scrollbar-width: none;
	}

	:global(.supersearch-input .cm-line) {
		@apply px-4;
		min-height: 28px;
		line-height: 28px;
	}

	:global(.supersearch-input .cm-focused) {
		outline: none;
	}

	:global(.codemirror-container .cm-content) {
		padding-top: 0.6125rem;
		padding-bottom: 0.6125rem;
		outline: none;
	}
</style>
