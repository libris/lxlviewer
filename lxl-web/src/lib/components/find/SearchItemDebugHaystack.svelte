<script lang="ts">
	import type { ItemDebugInfo } from '$lib/types/search';
	interface Props {
		debugInfo: ItemDebugInfo;
	}

	let { debugInfo }: Props = $props();

	let uniqueFields = debugInfo.score.perField.filter(
		(field, index, array) => array.findIndex((f) => f.name === field.name) == index
	);
</script>

<div class="text-xs">
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

<style>
	tbody > tr {
		border-top: gray solid 1px;
	}
</style>
