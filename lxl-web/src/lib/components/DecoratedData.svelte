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

	function getFilteredEntries(data: Record<string, ResourceData>) {
		return Object.entries(data).filter(([key]) => !hiddenProperties.includes(key));
	}

	function getObjectProperty(value: ResourceData, name: string) {
		if (value && typeof value === 'object' && !Array.isArray(value) && name in value) {
			return value[name];
		}
		return undefined;
	}

	function getLink(value: ResourceData) {
		const hints = getObjectProperty(value, '_hint');
		if (Array.isArray(hints) && hints.includes('link')) {
			return value?.['@id' as keyof typeof value];
		}
		return undefined;
	}

	function getElementType(value: ResourceData) {
		if (getLink(value)) {
			return 'a';
		}
		return 'span';
	}

	function getElementAttributes({ key, value }: { key: string; value: ResourceData }) {
		return {
			'data-property': key,
			href: getLink(value)
		};
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
				<svelte:element this={getElementType(value)} {...getElementAttributes({ key, value })}>
					<svelte:self data={value} />
				</svelte:element>
			{/if}
		{/each}
		{data?._contentAfter || ''}
	{/if}
{:else}
	{data}
{/if}
