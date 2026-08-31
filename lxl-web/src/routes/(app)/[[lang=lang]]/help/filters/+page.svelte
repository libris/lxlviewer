<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import Meta from '$lib/components/Meta.svelte';
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	import { page } from '$app/state';
	import { getSearchContext } from '$lib/contexts/search';
	import SvContent from './sv.md';
	import EnContent from './en.md';

	let { data } = $props();

	const searchContext = getSearchContext();
	const pageTitle = $derived(page.data.t('help.pageTitle'));

	const tableOfContents = $derived(
		data.filterGroups
			.filter((g) => g.label)
			.map((g) => ({
				id: toId('section', g.label),
				label: g.label
			}))
	);

	function toId(prefix: string, label: string) {
		return prefix + '-' + label.replaceAll(' ', '-');
	}

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

<article class="@container @xl:**:[[id]]:scroll-mt-20">
	{#if tableOfContents.length}
		<section data-testid="toc-mobile" class="contents xl:hidden print:hidden">
			<TableOfContents items={tableOfContents} mobile />
		</section>
	{/if}
	<div
		class="wide:max-w-screen mx-auto grid grid-cols-1 items-start gap-3 px-3 xl:grid-cols-[1fr_auto] @md:gap-6 @md:px-6 @7xl:gap-12 @7xl:px-12"
	>
		{#if tableOfContents.length}
			<div class="sticky top-22 order-last hidden h-fit xl:block print:hidden">
				<section data-testid="toc" class="py-3 @sm:py-6">
					<TableOfContents items={tableOfContents} />
				</section>
			</div>
		{/if}
		<div class="max-w-8xl mx-auto w-full py-3 @sm:py-6">
			<div class="max-ch-text">
				{#if data.locale === 'en'}
					<EnContent />
				{:else}
					<SvContent />
				{/if}
			</div>
			<div role="table" class="@container mt-12">
				<!-- Header row -->
				<div
					role="row"
					class="sr-only @3xl:not-sr-only @3xl:grid
					@3xl:grid-cols-[1fr_2fr_1.5fr_1fr] @3xl:gap-x-4"
				>
					<div id="filter-header" role="columnheader" class="py-3 font-medium">
						{page.data.t('help.filter')}
					</div>
					<div id="description-header" role="columnheader" class="py-3 font-medium">
						{page.data.t('help.description')}
					</div>
					<div id="searchin-header" role="columnheader" class="py-3 font-medium">
						{page.data.t('help.searchIn')}
					</div>
					<div id="code-header" role="columnheader" class="py-3 font-medium">
						{page.data.t('help.code')}
					</div>
				</div>

				{#each data.filterGroups as g, i (i)}
					<div
						role="rowgroup"
						aria-label={g.label}
						id={g.label ? toId('section', g.label) : undefined}
					>
						{#if g.label || g.filterGroupDescription}
							<div role="row" class="border-t border-gray-300 bg-neutral-100 px-2 py-3">
								{#if g.label}
									<div role="columnheader" aria-colspan="4" class="font-semibold">
										{g.label}
									</div>
								{/if}

								{#if g.filterGroupDescription}
									<div class="text-2s text-subtle max-ch-text pt-2 whitespace-pre-line">
										{g.filterGroupDescription}
									</div>
								{/if}
							</div>
						{/if}

						{#each g.filters as f (f.key)}
							<div
								role="row"
								id={f.key}
								class="border-t border-gray-300
								@3xl:grid
								@3xl:grid-cols-[minmax(min-content,1fr)_2fr_1.5fr_1fr]
								@3xl:gap-x-4
								@3xl:py-0"
							>
								<!-- Filter -->
								<div
									role="rowheader"
									id={`row-${f.key}`}
									aria-labelledby="filter-header row-{f.key}"
									class="min-w-0 my-4"
								>
									<div class="mb-2 text-xs font-medium text-neutral-500 @3xl:hidden">
										{page.data.t('help.filter')}
									</div>

									<button
										class="qualifier text-body bg-accent-50 hover:bg-accent-100 inline-block min-h-8 min-w-9 shrink-0 rounded-md px-1.5 text-sm font-medium whitespace-nowrap first-letter:capitalize"
										onclick={() => addQualifierKey(f.key)}
									>
										{f.label}
									</button>
								</div>

								<!-- Description -->
								<div
									role="cell"
									aria-labelledby={`description-header row-${f.key}`}
									class={[f.filterDescription ? '' : 'hidden md:block', 'min-w-0 my-3']}
								>
									<div class="mb-1 text-xs font-medium text-neutral-500 @3xl:hidden">
										{page.data.t('help.description')}
									</div>

									<span class="max-ch-text whitespace-pre-line">
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
								<div
									role="cell"
									aria-labelledby={`searchin-header row-${f.key}`}
									class={[f.propertyChainAxiom ? '' : 'hidden md:block', 'min-w-0 my-3']}
								>
									<div class="mb-1 text-xs font-medium text-neutral-500 @3xl:hidden">
										{page.data.t('help.searchIn')}
									</div>

									{#if f.propertyChainAxiom}
										<ul>
											{#each f.propertyChainAxiom as p (p)}
												<li class="text-s">{p.label}</li>
												<li class="text-2xs text-subtle mb-2 font-mono wrap-anywhere">
													{p.path}
												</li>
											{/each}
										</ul>
									{/if}
								</div>

								<!-- Code -->
								<div
									role="cell"
									aria-labelledby={`code-header row-${f.key}`}
									class={[f.queryCodes ? '' : 'hidden md:block', 'min-w-0 my-3']}
								>
									<div class="mb-1 text-xs font-medium text-neutral-500 @3xl:hidden">
										{page.data.t('help.code')}
									</div>

									<ul class="font-mono">
										<li class="text-xs wrap-anywhere">{f.key}</li>

										{#each f.queryCodes as q (q)}
											<li class="text-subtle text-xs">{q}</li>
										{/each}
									</ul>
								</div>
							</div>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</div>
</article>

<style lang="postcss">
	.qualifier {
		box-shadow: 0 0 0 1px var(--color-accent-200);
	}

	.max-ch-text {
		max-width: 60ch;
	}
</style>
