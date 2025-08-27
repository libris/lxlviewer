<script lang="ts">
	import { Cite, type CSLJSON } from '@citation-js/core';
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
			{@const formatted = cite.get({ style: 'bibtex', format: 'string', type: 'html' })}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html formatted}
		{:catch}
			<p>Oh no</p>
		{/await}
	{:else}
		<p>Kunde inte hämta referenser</p>
	{/if}
</div>
