<script lang="ts">
	import type { CSLJSON } from '$lib/types/citation';
	import { Cite } from '@citation-js/core';
	type Props = {
		citations: CSLJSON[];
	};

	let { citations }: Props = $props();
</script>

<div>
	{#if citations}
		{#await citations}
			<p>laddar...</p>
		{:then c}
			{@const cite = new Cite(c)}
			{@const harvard = cite.format('bibliography', { template: 'harvard1', format: 'html' })}
			{@const vancouver = cite.format('bibliography', { template: 'vancouver', format: 'html' })}
			{@const apa = cite.format('bibliography', { template: 'apa', format: 'html' })}
			{@const chicago = cite.format('bibliography', { template: 'chicago', format: 'html' })}
			{@const ris = cite.format('ris')}
			{@const bibtext = cite.format('bibtex')}

			<p class="my-2 font-bold">harvard</p>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html harvard}
			<p class="my-2 font-bold">vancouver</p>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html vancouver}
			<p class="my-2 font-bold">apa</p>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html apa}
			<p class="my-2 font-bold">chicago</p>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html chicago}
			<p class="my-2 font-bold">RIS</p>
			<pre>{ris}</pre>
			<p class="my-2 font-bold">bibtex</p>
			<pre><code>{bibtext}</code></pre>
		{:catch}
			<p>Oh no</p>
		{/await}
	{:else}
		<p>Kunde inte hämta referenser</p>
	{/if}
</div>
