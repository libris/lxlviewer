<script lang="ts">
	import { page } from '$app/state';
	import type { ItemDebugInfo } from '#lib/types/search.js';
	import EsExplain from '#lib/components/find/EsExplain.svelte';

	interface Props {
		debugInfo: ItemDebugInfo;
	}
	let { debugInfo }: Props = $props();

	let showDebugExplain = $state(false);
	let showDebugHaystack = $state(false);
	let score = $derived(debugInfo.score);

	function fmt(x: number) {
		return x.toLocaleString(page.data.locale, { maximumFractionDigits: 2 });
	}

	function fmtPercent(x: number) {
		return (x * 100).toLocaleString(page.data.locale, { maximumFractionDigits: 2 });
	}
</script>

{#key debugInfo}
	<div class="card-debug z-20 self-start text-left select-text">
		{@render debugTable()}
		<button
			type="button"
			class="text-xs"
			onclick={() => {
				showDebugHaystack = !showDebugHaystack;
			}}
		>
			Haystack
		</button>
		<button
			type="button"
			class="text-xs"
			onclick={() => {
				showDebugExplain = !showDebugExplain;
			}}
		>
			Explain
		</button>
	</div>
	{#if showDebugHaystack}
		<div class="z-20 col-span-full row-start-2 pt-4">
			{@render haystack()}
		</div>
	{/if}
	{#if showDebugExplain}
		<div class="z-20 col-span-full row-start-2 pt-4">
			<EsExplain explain={debugInfo.score.explain} />
		</div>
	{/if}
{/key}

{#snippet debugTable()}
	<div class="text-xs">
		<table class="table [&_td]:pl-2">
			<thead>
				<tr>
					<td></td>
					<td></td>
					<td>{fmtPercent(score.totalPercent)}%</td>
					<td>{fmt(score.total)}</td>
				</tr>
				<tr class="italic">
					<td>field</td>
					<td>needle</td>
					<td>this page</td>
					<td>score</td>
				</tr>
			</thead>
			<tbody>
				{#each score.perField as field (field.name)}
					<tr
						title="haystack: {field.haystack.slice(0, 1)}{field.haystack.length > 1
							? ` + ${field.haystack.length - 1}`
							: ''}"
					>
						<td>{field.name}</td>
						<td>{field.needle}</td>
						<td>{fmtPercent(field.scorePercent)}%</td>
						<td>{fmt(field.score)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/snippet}

{#snippet haystack()}
	{const uniqueFields = $derived(
		debugInfo.score.perField.filter(
			(field, index, array) => array.findIndex((f) => f.name === field.name) == index
		)
	)}
	<div class="haystack text-xs">
		<table class="table [&_td]:pl-2">
			<thead>
				<tr class="italic">
					<td>field</td>
					<td>haystack</td>
				</tr>
			</thead>
			<tbody>
				{#each uniqueFields as field (field.name)}
					<tr
						class="align-top"
						title="haystack: {field.haystack.slice(0, 1)}{field.haystack.length > 1
							? ` + ${field.haystack.length - 1}`
							: ''}"
					>
						<td>{field.name}</td>
						<td>
							{#each field.haystack as h, index (index)}
								<p>{h}</p>
							{/each}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/snippet}

<style>
	.card-debug {
		grid-area: debug;
	}

	.haystack tbody > tr {
		border-top: gray solid 1px;
	}
</style>
