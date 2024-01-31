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
		'_contentAfter',
		'_label'
	];

	const flattenedProperties = ['_display', '@value'];

	function getFilteredEntries(data: Record<string, ResourceData>) {
		return Object.entries(data).filter(([key]) => !hiddenProperties.includes(key));
	}

	function getObjectProperty(value: ResourceData, name: string) {
		if (value && typeof value === 'object' && !Array.isArray(value) && name in value) {
			return value[name];
		}
		return undefined;
	}

	function getLink(value: ResourceData): string | undefined {
		return (getObjectProperty(value, '@id') as string) || undefined;
		/*
		if (getObjectProperty(value, '_style') === 'link') {
			return getObjectProperty(value, '@id') as string
		}
		return undefined;
		*/
	}

	function getElementType({ key, value }: { key: string; value: ResourceData }) {
		if (key === '_style' && value === 'area') {
			return 'div';
		}
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

<!-- 
  @component
	Component used for rendering decorated data.
-->
{#if data && typeof data === 'object'}
	{#if Array.isArray(data)}
		{#each data as arrayItem}
			<svelte:self data={arrayItem} />
		{/each}
	{:else}
		{data?._contentBefore || ''}
		{#if data?._label}
			<strong>{data._label}</strong>
		{/if}
		{#each getFilteredEntries(data) as [key, value]}
			{#if flattenedProperties.includes(key)}
				<svelte:self data={value} />
			{:else}
				<svelte:element
					this={getElementType({ key, value })}
					{...getElementAttributes({ key, value })}
				>
					<svelte:self data={value} />
				</svelte:element>
			{/if}
		{/each}
		{data?._contentAfter || ''}
	{/if}
{:else}
	{data}
{/if}
