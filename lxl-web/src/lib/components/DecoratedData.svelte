<script lang="ts">
	import type { ResourceData } from '$lib/types/ResourceData';
	import resourcePopover from '$lib/actions/resourcePopover';
	import { getResourceId, getResourcePropertyStyle } from '$lib/utils/resourceData';
	import { relativize } from '$lib/utils/http';

	export let data: ResourceData;

	const hiddenProperties = [
		'@context',
		'@type',
		'@id',
		'_label',
		'_style',
		'_contentBefore',
		'_contentAfter'
	];

	const flattenedProperties = ['_display', '@value'];

	function getFilteredEntries(data: Record<string, ResourceData>) {
		return Object.entries(data).filter(([key]) => !hiddenProperties.includes(key));
	}

	function getLink(value: ResourceData) {
		if (getResourcePropertyStyle(value)?.includes('link')) {
			const id = getResourceId(value);
			if (id) {
				return relativize(id);
			}
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

	/* Conditionally add popover action so it's only added when needed */
	function conditionalResourcePopover(node: HTMLElement, value: ResourceData) {
		const style = getResourcePropertyStyle(value);
		if (style && style.includes('link' || style.includes('definition'))) {
			const id = getResourceId(value);
			if (id) {
				return resourcePopover(node, id);
			}
		}
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
		{#each getFilteredEntries(data) as [key, value]}
			{#if flattenedProperties.includes(key)}
				<svelte:self data={value} />
			{:else}
				<svelte:element
					this={getElementType(value)}
					{...getElementAttributes({ key, value })}
					use:conditionalResourcePopover={value}
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
