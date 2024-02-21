<script lang="ts">
	import type { ResourceData } from '$lib/types/ResourceData';
	import { page } from '$app/stores';
	import resourcePopover from '$lib/actions/resourcePopover';
	import { getResourceId, getResourcePropertyStyle } from '$lib/utils/resourceData';
	import { relativize } from '$lib/utils/http';
	import { getSupportedLocale } from '$lib/i18n/locales';
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

	/* Conditionally add popover action so it's only added when needed */
	function conditionalResourcePopover(node: HTMLElement, data: ResourceData) {
		const style = getResourcePropertyStyle(data);
		if (style && (style.includes('link') || style.includes('definition'))) {
			const id = getResourceId(data);
			if (id) {
				return resourcePopover(node, {
					id,
					lang: getSupportedLocale($page.params.lang)
				});
			}
		}
	}

	function getProperty(data: { [key: string]: ResourceData }) {
		return (
			Object.entries(data).find(
				([key, value]) => key && value && !hiddenProperties.includes(key)
			) || []
		);
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
		{#if data['@type']}
			<svelte:element
				this={getElementType(data)}
				href={getLink(data)}
				data-type={data['@type']}
				class:definition={getResourcePropertyStyle(data)?.includes('definition')}
				use:conditionalResourcePopover={data}
			>
				<svelte:self data={data['_display']} />
			</svelte:element>
		{:else if data['@value']}
			<svelte:self data={data['@value']} />
		{:else if data['_display']}
			<svelte:self data={data['_display']} />
		{:else}
			{@const [propertyName, propertyValue] = getProperty(data)}
			<span data-property={propertyName}><svelte:self data={propertyValue} /></span>
		{/if}
		{data?._contentAfter || ''}
	{/if}
{:else}
	{data}
{/if}

<style>
	.definition {
		text-decoration: underline;
		text-decoration-style: dotted;
		font-size: 0.875rem;
		color: #666;
		font-style: italic;
	}
</style>
