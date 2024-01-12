<script lang="ts">
	import type { SvelteComponent, ComponentType } from 'svelte';

	export let data: { [key: string]: unknown } | string | number | boolean | null;
	export let key: string | undefined = undefined;
	export let propertyElementType: string | undefined = undefined;

	export let customValueComponent:
		| ComponentType<
				SvelteComponent<{ key: string | undefined; value: string | number | boolean | null }>
		  >
		| undefined = undefined;

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
		{#each data as arrayItem}<svelte:self data={arrayItem} {key} {customValueComponent} />{/each}
	{:else}
		<!-- prettier-ignore -->{#each getFilteredEntries(data) as [key, value]}{data?._contentBefore || ''}{#if key === '_display'}<svelte:self data={value} {key} {customValueComponent} />{:else}{#if propertyElementType}<svelte:element this={propertyElementType} data-property={key} data-type={data?.['@type']} data-hint={data?.['_hint']}><svelte:self data={value} {key} {customValueComponent} /></svelte:element>{:else}<svelte:self data={value} {key} {customValueComponent} />{/if}{/if}{data?._contentAfter || ''}{/each}
	{/if}
{:else if customValueComponent}
	<svelte:component this={customValueComponent} {key} value={data} />
{:else}
	{data}
{/if}
