<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import Meta from '$lib/components/Meta.svelte';
	import { page } from '$app/state';

	let { data } = $props();

	const pageTitle = page.data.t('help.pageTitle');
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

<article class="mt-8 mb-12 p-4 sm:px-6">
	<table class="w-full">
		<thead class="border-b border-gray-300">
			<tr class="[&>th]:p-3 [&>th]:text-left [&>th]:align-top">
				<th>{page.data.t('help.filter')}</th>
				<th>{page.data.t('help.description')}</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-300 [&>tr>td]:p-3 [&>tr>td]:text-left [&>tr>td]:align-top">
			{#each data.filterDefs as f (f.key)}
				<tr>
					<td>
						<button
							class="qualifier text-body bg-accent-50 text-2xs hover:bg-accent-100 inline-block min-h-8 min-w-9 shrink-0 rounded-md px-1.5 font-medium whitespace-nowrap capitalize"
							>{f.label}</button
						>
						<ul class="mt-2 font-mono">
							<li class="text-xs">{f.key}</li>
							{#each f.queryCodes as q (q)}
								<li class="text-subtle text-xs">{q}</li>
							{/each}
						</ul>
					</td>
					<td>
						{f.comment}
						{#if f.propertyChainAxiom}
							<ul class={['mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2']}>
								{#each f.propertyChainAxiom as p (p)}
									<li class="text-xs">{p.label}</li>
									<li class="font-mono text-xs">{p.path}</li>
								{/each}
							</ul>
						{/if}
					</td>
				</tr>
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
