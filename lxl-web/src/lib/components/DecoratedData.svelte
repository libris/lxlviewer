<script lang="ts">
	import type { ResourceData } from '$lib/types/ResourceData';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';
	import { page } from '$app/stores';
	import resourcePopover from '$lib/actions/resourcePopover';
	import { hasStyle, getStyle, getResourceId, getPropertyValue } from '$lib/utils/resourceData';
	import { relativizeUrl } from '$lib/utils/http';
	import { getSupportedLocale } from '$lib/i18n/locales';

	export let data: ResourceData;
	export let depth = 0;
	export let showLabels: ShowLabelsOptions = ShowLabelsOptions.ByPropertyStyle;
	export let block = false;

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
		if (depth > 1 && hasStyle(data, 'link')) {
			const id = getResourceId(value);
			if (id) {
				return relativizeUrl(id);
			}
		}
		return undefined;
	}

	function getElementType(value: ResourceData) {
		if (getLink(value)) {
			return 'a';
		}
		if (block && depth <= 2) {
			return 'div';
		}
		return 'span';
	}

	/* Conditionally add popover action so it's only added when needed */
	function conditionalResourcePopover(node: HTMLElement, data: ResourceData) {
		if ((depth > 1 && hasStyle(data, 'link')) || hasStyle(data, 'definition')) {
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

	function getStyleClasses(data: ResourceData) {
		const style = getStyle(data);
		return style ? style.join(' ') : '';
	}

	function shouldShowContentBefore() {
		if (block && depth > 2 && getPropertyValue(data, '_contentBefore')) {
			return true;
		}
		return false;
	}

	function shouldShowContentAfter() {
		if (block && depth > 2 && getPropertyValue(data, '_contentAfter')) {
			return true;
		}
		return false;
	}
</script>

<!-- 
  @component
	Component used for rendering decorated data.
-->
{#if data && typeof data === 'object'}
	{#if Array.isArray(data)}
		{#each data as arrayItem}
			<svelte:self data={arrayItem} depth={depth + 1} {showLabels} {block} />
		{/each}
	{:else}
		{#if shouldShowContentBefore()}
			<span class="_contentBefore">
				{data._contentBefore}
			</span>
		{/if}
		{#if data['@type']}
			<svelte:element
				this={getElementType(data)}
				href={getLink(data)}
				data-type={data['@type']}
				class={getStyleClasses(data)}
				use:conditionalResourcePopover={data}
			>
				<svelte:self data={data['_display']} depth={depth + 1} {showLabels} {block} />
			</svelte:element>
		{:else if data['@value']}
			<svelte:self data={data['@value']} depth={depth + 1} {showLabels} {block} />
		{:else if data['_display']}
			<svelte:self data={data['_display']} depth={depth + 1} {showLabels} {block} />
		{:else}
			{@const [propertyName, propertyData] = getProperty(data)}
			{#if propertyName && propertyData}
				<svelte:element this={getElementType(propertyData)} data-property={propertyName}>
					{#if showLabels === ShowLabelsOptions.Always || (showLabels === ShowLabelsOptions.ByPropertyStyle && depth <= 2 && !hasStyle(data, 'nolabel'))}
						<strong>
							{data._label}
						</strong>
					{/if}
					<svelte:self data={propertyData} depth={depth + 1} {showLabels} {block} />
				</svelte:element>
			{/if}
		{/if}
		{#if shouldShowContentAfter()}
			<span class="_contentAfter">
				{data._contentAfter}
			</span>
		{/if}
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

	.pill {
		@apply rounded-md border border-accent-dark p-1 no-underline;
	}
</style>
