<script lang="ts">
	import type { ItemDebugInfo } from '$lib/types/search';
	import { page } from '$app/stores';

	export let debugInfo: ItemDebugInfo;
	let score = debugInfo.score;

	function fmt(x: number) {
		return x.toLocaleString($page.data.locale, { maximumFractionDigits: 2 });
	}

	function fmtPercent(x: number) {
		return (x * 100).toLocaleString($page.data.locale, { maximumFractionDigits: 2 });
	}
</script>

<div class="text-xs">
	<table class="table">
		<thead>
			<tr>
				<td></td>
				<td></td>
				<td>{fmtPercent(score.totalPercent)}%</td>
				<td class="text-3-cond-bold">{fmt(score.total)}</td>
			</tr>
			<tr class="italic">
				<td>field</td>
				<td>needle</td>
				<td>this page</td>
				<td>score</td>
			</tr>
		</thead>
		<tbody>
			{#each score.perField as field}
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

<style lang="postcss">
	td {
		@apply pl-2;
	}
</style>
