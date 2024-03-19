<script lang="ts">
	import DecoratedData from './DecoratedData.svelte';
	import jmespath from 'jmespath';

	export let data: DecoratedData;
	export let columns: string[]; // currently uses jmespath for querying data for the column (should probably be replaced with custom methods or some kind of table lens)
</script>

<table class="w-full table-fixed">
	<tbody>
		{#if Array.isArray(data)}
			{#each data as item (item['@id'])}
				<tr class="border-b border-b-primary/16 last:border-b-0">
					{#each columns as columnItem}
						<td class="p-4">
							<DecoratedData data={jmespath.search(item, columnItem)} />
						</td>
					{/each}
				</tr>{/each}
		{/if}
	</tbody>
</table>
