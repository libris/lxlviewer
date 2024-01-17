<script lang="ts">
	type ResourceData =
		| null
		| boolean
		| string
		| number
		| ResourceData[]
		| undefined
		| { [key: string]: ResourceData };

	export let data: ResourceData;

	const elementType: string = 'span';

	const hiddenProperties = [
		'@context',
		'@type',
		'@id',
		'_hint',
		'_style',
		'_contentBefore',
		'_contentAfter'
	];

	const flattenProperties = ['_display', '@value'];

	function getFilteredEntries(data: Record<string, unknown>) {
		return Object.entries(data).filter(([key]) => !hiddenProperties.includes(key));
	}
</script>

{#if data && typeof data === 'object'}
	{#if Array.isArray(data)}
		{#each data as arrayItem}
			<svelte:self data={arrayItem} />
		{/each}
	{:else}
		{data?._contentBefore || ''}
		{#each getFilteredEntries(data) as [key, value]}
			{#if flattenProperties.includes(key)}
				<svelte:self data={value} />
			{:else}
				<svelte:element this={elementType} data-property={key} data-type={data?.['@type']}>
					<svelte:self data={value} />
				</svelte:element>
			{/if}
		{/each}
		{data?._contentAfter || ''}
	{/if}
{:else}
	{data}
{/if}
