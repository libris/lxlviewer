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
	export let showLabels: ShowLabelsOptions = ShowLabelsOptions.DefaultOn;
	export let allowPopovers = true; // used for preventing nested popovers
	export let block = false;
	export let truncate = false;

	// truncate option; use only first item as data and keep the rest for tooltip
	let remainder: ResourceData[] | undefined;
	if (truncate && Array.isArray(data) && data?.[0] && '@type' in data[0]) {
		[data, ...remainder] = data;
		truncate = false;
	}

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
		if (block && isTopLevel()) {
			return 'div';
		}
		return 'span';
	}

	/* Conditionally add popover action so it's only added when needed */
	function conditionalResourcePopover(node: HTMLElement, data: ResourceData) {
		if (allowPopovers && ((depth > 1 && hasStyle(data, 'link')) || hasStyle(data, 'definition'))) {
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
		if (style && depth > 1) {
			return style.join(' ');
		}
		return '';
	}

	function shouldShowContentBefore() {
		if (getPropertyValue(data, '_contentBefore')) {
			if (block) {
				return !isTopLevel();
			} else {
				return true;
			}
		}
		return false;
	}

	function shouldShowContentAfter() {
		if (getPropertyValue(data, '_contentAfter')) {
			if (block) {
				return !isTopLevel();
			} else {
				return true;
			}
		}
		return false;
	}

	function isTopLevel() {
		return depth <= 2;
	}

	function shouldShowLabels() {
		return (
			isTopLevel() &&
			(showLabels === ShowLabelsOptions.Always ||
				(showLabels === ShowLabelsOptions.DefaultOn && !hasStyle(data, 'nolabel')) ||
				(showLabels === ShowLabelsOptions.DefaultOff && !hasStyle(data, 'label')))
		);
	}
</script>

<!-- 
  @component
	Component used for rendering decorated data.
-->
{#key data}
	{#if data && typeof data === 'object'}
		{#if Array.isArray(data)}
			{#each data as arrayItem}
				<svelte:self
					data={arrayItem}
					depth={depth + 1}
					{showLabels}
					{block}
					{allowPopovers}
					{truncate}
				/>
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
					<svelte:self
						data={data['_display']}
						depth={depth + 1}
						{showLabels}
						{block}
						{allowPopovers}
						{truncate}
					/>
					{#if remainder}
						<span
							use:resourcePopover={{ data: remainder, lang: getSupportedLocale($page.params.lang) }}
							class="remainder">+ {remainder.length}</span
						>
					{/if}
				</svelte:element>
			{:else if data['@value']}
				<svelte:self data={data['@value']} depth={depth + 1} {showLabels} {block} {allowPopovers} />
			{:else if data['_display']}
				<svelte:self
					data={data['_display']}
					depth={depth + 1}
					{showLabels}
					{block}
					{allowPopovers}
					{truncate}
				/>
			{:else}
				{@const [propertyName, propertyData] = getProperty(data)}
				{#if propertyName && propertyData}
					<svelte:element this={getElementType(propertyData)} data-property={propertyName}>
						{#if shouldShowLabels()}
							<small>
								{data._label}
							</small>
						{/if}
						<svelte:self
							data={propertyData}
							depth={depth + 1}
							{showLabels}
							{block}
							{allowPopovers}
							{truncate}
						/>
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
{/key}

<style lang="postcss">
	a {
		color: inherit;
	}
	.definition {
		text-decoration: underline;
		text-decoration-style: dotted;
		font-size: 0.875rem;
		color: #666;
		font-style: italic;
	}

	.pill {
		@apply mb-1 mr-1 inline-block rounded-full bg-pill/8 px-3 py-1 no-underline;
	}
	a.pill {
		@apply hover:bg-pill/16 focus:bg-pill/16;
	}

	.remainder {
		@apply ml-2 rounded-full bg-pill/8 px-2 py-1 text-secondary;
	}
</style>
