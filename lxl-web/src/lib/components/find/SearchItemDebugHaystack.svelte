<script lang="ts">
	import type { ItemDebugInfo } from '$lib/types/search';
	export let debugInfo: ItemDebugInfo;

	let uniqueFields = debugInfo.score.perField.filter(
		(field, index, array) => array.findIndex((f) => f.name === field.name) == index
	);
</script>

<div class="text-xs">
	<table class="table">
		<thead>
			<tr class="italic">
				<td>field</td>
				<td>haystack</td>
			</tr>
		</thead>
		<tbody>
			{#each uniqueFields as field}
				<tr
					class="align-top"
					title="haystack: {field.haystack.slice(0, 1)}{field.haystack.length > 1
						? ` + ${field.haystack.length - 1}`
						: ''}"
				>
					<td>{field.name}</td>
					<td>
						{#each field.haystack as h}
							<p>{h}</p>
						{/each}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style lang="postcss">
	td {
		@apply pl-2;
	}
	tbody > tr {
		border-top: gray solid 1px;
	}
</style>
