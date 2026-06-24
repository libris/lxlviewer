<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import Meta from '$lib/components/Meta.svelte';
	import { page } from '$app/state';
	import { getSearchContext } from '$lib/contexts/search';
	import SvContent from './sv.md';
	import EnContent from './en.md';

	let { data } = $props();

	const searchContext = getSearchContext();
	const pageTitle = $derived(page.data.t('help.pageTitle'));

	function addQualifierKey(key: string) {
		const superSearch = searchContext.superSearch;
		if (superSearch) {
			const query = superSearch.getQuery();
			const insert = query + ` ${key}:()`;
			superSearch?.dispatchChange({
				change: { from: 0, to: query.length, insert },
				selection: {
					anchor: insert.length - 1,
					head: insert.length - 1
				}
			});
		}
	}
</script>

<svelte:head>
	<title>{getPageTitle(pageTitle, page.data.siteName)}</title>
</svelte:head>

<Meta
	title={pageTitle}
	description={page.data.t('help.pageDescription')}
	url={page.url.origin + page.url.pathname}
	siteName={getPageTitle(undefined, page.data.siteName)}
/>

<article class="@container mx-auto mt-8 mb-12 w-full max-w-7xl p-4 sm:px-6">
	{#if data.locale === 'en'}
		<EnContent />
	{:else}
		<SvContent />
	{/if}
	<div class="@container mt-2">
		<!-- Header row -->
		<div
			class="hidden border-b border-gray-300 @3xl:grid
		       @3xl:grid-cols-[1fr_2fr_1.5fr_1fr]
					 @3xl:gap-x-4"
		>
			<div class="p-3 font-medium">{page.data.t('help.filter')}</div>
			<div class="p-3 font-medium">{page.data.t('help.description')}</div>
			<div class="p-3 font-medium">{page.data.t('help.searchIn')}</div>
			<div class="p-3 font-medium">{page.data.t('help.code')}</div>
		</div>

		{#each data.filterGroups as g, i (i)}
			{#if g.label || g.filterGroupDescription}
				<div class="border-b border-gray-300 bg-neutral-100 px-4 py-3">
					{#if g.label}
						<div class="font-semibold">
							{g.label}
						</div>
					{/if}

					{#if g.filterGroupDescription}
						<div class="text-2s text-subtle pt-2 whitespace-pre-line">
							{g.filterGroupDescription}
						</div>
					{/if}
				</div>
			{/if}

			{#each g.filters as f (f.key)}
				<div
					id={f.key}
					class="border-b border-gray-300 py-4
				       @3xl:grid
				       @3xl:grid-cols-[1fr_2fr_1.5fr_1fr]
				       @3xl:gap-x-4
				       @3xl:py-0"
				>
					<!-- Filter -->
					<div class="min-w-0 p-3">
						<div class="mb-1 text-xs font-medium text-neutral-500 @3xl:hidden">
							{page.data.t('help.filter')}
						</div>

						<button
							class="qualifier text-body bg-accent-50 text-2xs hover:bg-accent-100 inline-block min-h-8 min-w-9 shrink-0 rounded-md px-1.5 font-medium whitespace-nowrap first-letter:capitalize"
							onclick={() => addQualifierKey(f.key)}
						>
							{f.label}
						</button>
					</div>

					<!-- Description -->
					<div class="min-w-0 p-3">
						<div class="mb-1 text-xs font-medium text-neutral-500 @3xl:hidden">
							{page.data.t('help.description')}
						</div>

						<span class="whitespace-pre-line">
							{f.filterDescription}
						</span>

						{#if f.descriptionRemark}
							<div class="mt-4">
								{#each f.descriptionRemark as remark, i (i)}
									<div>
										<span>ⓘ {remark}</span>
									</div>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Search in -->
					<div class="min-w-0 p-3">
						<div class="mb-1 text-xs font-medium text-neutral-500 @3xl:hidden">
							{page.data.t('help.searchIn')}
						</div>

						{#if f.propertyChainAxiom}
							<ul>
								{#each f.propertyChainAxiom as p (p)}
									<li class="text-s">{p.label}</li>
									<li class="text-2xs text-subtle mb-2 font-mono [overflow-wrap:anywhere]">
										{p.path}
									</li>
								{/each}
							</ul>
						{/if}
					</div>

					<!-- Code -->
					<div class="min-w-0 p-3">
						<div class="mb-1 text-xs font-medium text-neutral-500 @3xl:hidden">
							{page.data.t('help.code')}
						</div>

						<ul class="font-mono">
							<li class="text-xs [overflow-wrap:anywhere]">{f.key}</li>

							{#each f.queryCodes as q (q)}
								<li class="text-subtle text-xs">{q}</li>
							{/each}
						</ul>
					</div>
				</div>
			{/each}
		{/each}
	</div>
</article>

<style lang="postcss">
	.qualifier {
		box-shadow: 0 0 0 1px var(--color-accent-200);
	}
</style>
