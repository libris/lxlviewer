<script lang="ts">
	import type { ComponentType } from 'svelte';

	type ResourceData =
		| null
		| boolean
		| string
		| number
		| ResourceData[]
		| undefined
		| { [key: string]: ResourceData };

	export let data: ResourceData;
	export let elementType: string | undefined = 'span';

	export let customComponent: ComponentType | { [key: string]: ComponentType } | undefined =
		undefined;

	const hiddenProperties = [
		'@context',
		'@type',
		'@id',
		'_hint',
		'_style',
		'_contentBefore',
		'_contentAfter'
	];

	export function getFilteredEntries(data: Record<string, unknown>) {
		return Object.entries(data).filter(([key]) => !hiddenProperties?.includes(key));
	}
</script>

{#if data && typeof data === 'object'}
	{#if Array.isArray(data)}
		{#each data as arrayItem}
			<svelte:self data={arrayItem} {elementType} {customComponent} />
		{/each}
	{:else}
		{data?._contentBefore || ''}
		{#each getFilteredEntries(data) as [key, value]}
			{#if key === '_display' || key === '@value'}
				<svelte:self data={value} {elementType} {customComponent} />
			{:else if customComponent && typeof customComponent === 'object' && Object.hasOwn(customComponent, key)}
				<svelte:component this={customComponent[key]} name={key} {value} parentData={data}>
					<svelte:self data={value} {elementType} {customComponent} />
				</svelte:component>
			{:else if customComponent && typeof customComponent !== 'object'}
				<svelte:component this={customComponent} name={key} {value} parentData={data}>
					<svelte:self data={value} {elementType} {customComponent} />
				</svelte:component>
			{:else if elementType}
				<svelte:element this={elementType} data-property={key} data-type={data?.['@type']}>
					<svelte:self data={value} {elementType} {customComponent} />
				</svelte:element>
			{:else}
				<svelte:self data={value} {elementType} {customComponent} />
			{/if}
		{/each}
		{data?._contentAfter || ''}
	{/if}
{:else}
	{data}
{/if}
