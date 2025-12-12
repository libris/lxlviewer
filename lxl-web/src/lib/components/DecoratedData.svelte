<script lang="ts">
	import DecoratedData from './DecoratedData.svelte';
	import type { ResourceData } from '$lib/types/resourceData';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import { page } from '$app/state';
	import popover from '$lib/actions/popover';
	import { hasStyle, getStyle, getResourceId, getPropertyValue } from '$lib/utils/resourceData';
	import { relativizeUrl, trimSlashes } from '$lib/utils/http';
	import { getSupportedLocale } from '$lib/i18n/locales';

	interface Props {
		data: ResourceData;
		depth?: number;
		showLabels?: 'always' | 'never' | 'defaultOn' | 'defaultOff';
		allowPopovers?: boolean; // used for preventing nested popovers
		allowLinks?: boolean;
		block?: boolean;
		limit?: Record<string, number>;
		keyed?: boolean;
	}

	let {
		data,
		depth = 0,
		showLabels = 'defaultOn',
		allowPopovers = true,
		allowLinks = true,
		block = false,
		limit = undefined,
		keyed = true
	}: Props = $props();

	let key = $derived(keyed && data); // an ugly work-around to fix duplicate content on out transitions when closing modals (not entirely sure what the root cause is...) – we should try to remove the need for this when updating to Svelte 5.

	const hiddenProperties = [
		'@context',
		'@type',
		'@id',
		'_label',
		'_style',
		'_contentBefore',
		'_contentAfter'
	];

	let delimitedShown = $state(false);

	function getLink(value: ResourceData) {
		if (allowLinks) {
			if (depth > 1 && hasStyle(data, 'link')) {
				const id = getResourceId(value);
				if (id) {
					return page.data.localizeHref(trimSlashes(relativizeUrl(id)));
				}
			}
			if (depth > 1 && hasStyle(data, 'ext-link')) {
				const id = getResourceId(value);
				if (id) {
					return id;
				}
			}
		}
		return undefined;
	}

	function getElementType(value: ResourceData) {
		if (allowLinks && getLink(value)) {
			return 'a';
		}
		if (block && isTopLevel()) {
			return 'div';
		}
		return 'span';
	}

	/* Conditionally add popover action so it's only added when needed */
	function conditionalPopover(node: HTMLElement, data: ResourceData) {
		if (allowPopovers && ((depth > 1 && hasStyle(data, 'link')) || hasStyle(data, 'definition'))) {
			const id = getResourceId(data);
			if (id) {
				return popover(node, {
					resource: {
						id,
						lang: getSupportedLocale(page.params.lang)
					}
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
				(showLabels === ShowLabelsOptions.DefaultOff && hasStyle(data, 'label')))
		);
	}
</script>

<!--
  @component
	Component used for rendering decorated data.
-->
{#key key}
	{#if data && typeof data === 'object'}
		{#if Array.isArray(data)}
			{#each data as arrayItem (arrayItem)}
				<DecoratedData
					data={arrayItem}
					depth={depth + 1}
					{showLabels}
					{block}
					{allowLinks}
					{allowPopovers}
					{limit}
					{keyed}
				/>
			{/each}
		{:else}
			{#if shouldShowContentBefore()}
				<span class={`_contentBefore ${getStyleClasses(data)}`}>
					{data._contentBefore}
				</span>
			{/if}
			{#if data['@type']}
				<svelte:element
					this={getElementType(data)}
					href={getLink(data)}
					target={hasStyle(data, 'ext-link') ? '_blank' : null}
					data-type={data['@type']}
					class={getStyleClasses(data)}
					use:conditionalPopover={data}
				>
					<DecoratedData
						data={data['_display']}
						depth={depth + 1}
						{showLabels}
						{block}
						{allowLinks}
						{allowPopovers}
						{limit}
						{keyed}
					/>
				</svelte:element>
			{:else if data['@value']}
				<DecoratedData
					data={data['@value']}
					depth={depth + 1}
					{showLabels}
					{block}
					{allowLinks}
					{allowPopovers}
					{keyed}
				/>
			{:else if data['_display']}
				<DecoratedData
					data={data['_display']}
					depth={depth + 1}
					{showLabels}
					{block}
					{allowLinks}
					{allowPopovers}
					{keyed}
				/>
			{:else}
				{@const [propertyName, propertyData] = getProperty(data)}
				{#if propertyName && propertyData}
					<!-- don't use 'show more' when exceeding limit by one -->
					{@const limitTo = limit?.[propertyName]}
					{@const delimited =
						limitTo && Array.isArray(propertyData) && propertyData.length > limitTo + 1}
					<svelte:element
						this={getElementType(propertyData)}
						data-property={propertyName}
						class={getStyleClasses(data)}
					>
						{#if shouldShowLabels() && typeof data._label === 'string'}
							<svelte:element this={block ? 'div' : 'span'}>
								<!-- Add inner span with inline-block to achieve first letter capitalization while still supporting inline whitespaces -->
								<span class={['inline-block first-letter:capitalize', block && 'property-label']}>
									{data._label}
								</span>
								<!-- eslint-disable-next-line svelte/no-useless-mustaches -->
								{' '}
							</svelte:element>
						{/if}
						<DecoratedData
							data={delimited && !delimitedShown ? propertyData.slice(0, limitTo) : propertyData}
							depth={depth + 1}
							{showLabels}
							{block}
							{allowLinks}
							{allowPopovers}
							{keyed}
						/>
						{#if delimited}
							{#if allowLinks}
								{@const delimitText = delimitedShown
									? page.data.t('search.showFewer')
									: `${page.data.t('search.showMore')} (+${propertyData.length - limitTo})`}
								<button
									class="delimiter link-subtle"
									type="button"
									onclick={() => (delimitedShown = !delimitedShown)}>{delimitText}</button
								>
							{:else}
								<span>{` +${propertyData.length - limitTo} ${page.data.t('general.more')}`}</span>
							{/if}
						{/if}
					</svelte:element>
				{/if}
			{/if}
			{#if shouldShowContentAfter()}
				<span class={`_contentAfter ${getStyleClasses(data)}`}>
					{data._contentAfter}
				</span>
			{/if}
		{/if}
	{:else}
		{data}
	{/if}
{/key}

<style lang="postcss">
	.definition {
		text-decoration-line: underline;
		text-decoration-style: dotted;
	}

	.property-label {
		color: var(--color-subtle);
	}

	.block {
		display: block;
		width: fit-content;
	}

	/* resource property-specific styles */
	.genre-form {
		display: flex;
		flex-wrap: wrap;
		gap: calc(var(--spacing) * 1.5);
		font-size: var(--text-2xs);

		/* pill */
		& > * {
			border: 1px solid var(--color-neutral-200);
			border-radius: calc(infinity * 1px);
			padding-block: calc(var(--spacing) * 1.5);
			padding-inline: calc(var(--spacing) * 3);
			text-decoration: none;
			white-space: nowrap;
		}

		& > a {
			border-color: var(--color-accent-200);

			&:hover {
				background-color: var(--color-primary-100);
			}
		}
	}

	.transliteration {
		font-style: italic;
	}

	.sigel {
		color: var(--color-subtle);
	}

	/* decorated data in popover */
	:global(.popover) {
		& .property-label {
			font-size: var(--text-3xs);
		}

		& div[data-property]:not(:last-child) {
			margin-bottom: calc(var(--spacing) * 1);
		}
	}

	button.delimiter {
		margin-left: calc(var(--spacing) * 1.5);
	}

	:global(.block + button.delimiter) {
		margin-left: 0;
	}
</style>
