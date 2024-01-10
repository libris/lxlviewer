<script lang="ts">
	export let data: { [key: string]: unknown } | string | number;

	const hiddenProperties = [
		'@context',
		'@type',
		'@id',
		'_hint',
		'_style',
		'_contentBefore',
		'_contentAfter'
	];

	export function getFilteredEntries(data: { [key: string]: unknown }) {
		return Object.entries(data).filter(([key]) => !hiddenProperties?.includes(key));
	}
</script>

{#if data && typeof data === 'object'}
	{#if Array.isArray(data)}
		{#each data as arrayItem}
			<svelte:self data={arrayItem} />
		{/each}
	{:else}
		{data?._contentBefore || ' '}
		<!-- Strange formatting is needed here to ensure no extra whitespaces are added between the elements... -->
		<!-- prettier-ignore -->
		{#each getFilteredEntries(data) as [key, value]}
			<span data-property={key} data-type={data?.['@type']} data-hint={data?.['_hint']}>
				<svelte:self data={value} /></span
			>{/each}{data?._contentAfter || ''}
	{/if}
{:else}
	{data}
{/if}
