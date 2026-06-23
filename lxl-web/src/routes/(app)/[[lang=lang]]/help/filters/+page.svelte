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
			const insert = ` ${key}:()`;
			const query = superSearch.getQuery();
			const anchor = query.length + insert.length - 1;
			const head = anchor;
			superSearch?.dispatchChange({
				change: { from: 0, to: query.length, insert },
				selection: {
					anchor,
					head
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

<article class="mx-auto mt-8 mb-12 w-7xl p-4 sm:px-6">
	{#if data.locale === 'en'}
		<EnContent />
	{:else}
		<SvContent />
	{/if}
	<table class="mt-2 w-full">
		<thead class="border-b border-gray-300">
			<tr class="[&>th]:p-3 [&>th]:text-left [&>th]:align-top">
				<th>{page.data.t('help.keyword')}</th>
				<th>{page.data.t('help.description')}</th>
				<th>{page.data.t('help.searchIn')}</th>
				<th>{page.data.t('help.code')}</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-300 [&>tr>td]:p-3 [&>tr>td]:text-left [&>tr>td]:align-top">
			{#each data.filterGroups as g, i (i)}
				{#if g.label || g.filterGroupDescription}
					<tr>
						<td colspan="4" class="bg-neutral-100 px-4 py-2">
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
						</td>
					</tr>
				{/if}
				{#each g.filters as f (f.key)}
					<tr id={f.key}>
						<td>
							<button
								class="qualifier text-body bg-accent-50 text-2xs hover:bg-accent-100 inline-block min-h-8 min-w-9 shrink-0 rounded-md px-1.5 font-medium whitespace-nowrap first-letter:capitalize"
								onclick={() => addQualifierKey(f.key)}
							>
								{f.label}
							</button>
						</td>
						<td>
							<div>
								<span class="whitespace-pre-line">{f.filterDescription}</span>
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
						</td>
						<td>
							{#if f.propertyChainAxiom}
								<div>
									<ul>
										{#each f.propertyChainAxiom as p (p)}
											<li class="text-s">{p.label}</li>
											<li class="text-2xs text-subtle mb-2 font-mono">{p.path}</li>
										{/each}
									</ul>
								</div>
							{/if}
						</td>
						<td>
							<ul class=" font-mono">
								<li class="text-xs">{f.key}</li>
								{#each f.queryCodes as q (q)}
									<li class="text-subtle text-xs">{q}</li>
								{/each}
							</ul>
						</td>
					</tr>
				{/each}
			{/each}
		</tbody>
	</table>
	<!--
	{#each data.filters as f (f['@id'])}
		<pre>{JSON.stringify(f, null, 2)}</pre>
	{/each}
    {#each data.filterDefs as f (f.key)}
        <pre>{JSON.stringify(f, null, 2)}</pre>
    {/each}
    -->
</article>

<style lang="postcss">
	.qualifier {
		box-shadow: 0 0 0 1px var(--color-accent-200);
	}
</style>
