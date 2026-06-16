<script lang="ts">
	import DecoratedData from './DecoratedData.svelte';
	import { Fmt, JsonLd } from '$lib/types/xl';
	import type { ResourceData } from '$lib/types/resourceData';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import { page } from '$app/state';
	import popover from '$lib/actions/popover';
	import { hasStyle, getStyle, getResourceId, getPropertyValue } from '$lib/utils/resourceData';
	import { relativizeUrl, trimSlashes } from '$lib/utils/http';
	import { getSupportedLocale } from '$lib/i18n/locales';
	import Wrapper from './Wrapper.svelte';

	interface Props {
		data: ResourceData;
		depth?: number;
		showLabels?: 'always' | 'never' | 'defaultOn' | 'defaultOff';
		allowPopovers?: boolean; // used for preventing nested popovers
		allowLinks?: boolean;
		allowFindLinks?: boolean;
		block?: boolean;
		limit?: Record<string, number>;
		keyed?: boolean;
		suppressProperty?: string[];
		isInsideLinkElement?: boolean;
		isLi?: boolean;
		isLiChild: boolean;
	}

	let {
		data,
		depth = 0,
		showLabels = 'defaultOn',
		allowPopovers = true,
		allowLinks = true,
		allowFindLinks = false,
		block = false,
		limit = undefined,
		keyed = true,
		suppressProperty = undefined,
		isInsideLinkElement = false,
		isLi = false,
		isLiChild = false
	}: Props = $props();

	let key = $derived(keyed && data); // an ugly work-around to fix duplicate content on out transitions when closing modals (not entirely sure what the root cause is...) – we should try to remove the need for this when updating to Svelte 5.

	const hiddenProperties = [
		JsonLd.CONTEXT,
		JsonLd.TYPE,
		JsonLd.ID,
		Fmt.LABEL,
		Fmt.STYLE,
		Fmt.CONTENT_BEFORE,
		Fmt.CONTENT_AFTER
	];

	let delimitedShown = $state(false);

	function getLink(value: ResourceData) {
		if (!isInsideLinkElement && allowLinks) {
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
			if (allowFindLinks && depth > 1 && hasStyle(data, 'find-link')) {
				const link = getPropertyValue(value, Fmt.FIND_LINK);
				if (link) {
					return page.data.localizeHref(link);
				}
			}
		}
		return undefined;
	}

	function getElementType(value: ResourceData) {
		if (!isInsideLinkElement && allowLinks && getLink(value)) {
			return 'a';
		}
		if (block && isTopLevel()) {
			return 'div';
		}
		return 'span';
	}

	function isUl(data: ResourceData, propertyData: ResourceData): boolean {
		return (
			!!getStyle(data)?.includes('ul') ||
			(!!getStyle(data)?.includes('ul-when-multiple') &&
				Array.isArray(propertyData) &&
				propertyData.length > 1)
		);
	}

	/* Conditionally add popover action so it's only added when needed */
	function conditionalPopover(node: HTMLElement, data: ResourceData) {
		if (
			allowPopovers &&
			!isInsideLinkElement &&
			((depth > 1 && hasStyle(data, 'link')) || hasStyle(data, 'definition'))
		) {
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
		if (getPropertyValue(data, Fmt.CONTENT_BEFORE)) {
			if (isLiChild) {
				return false;
			} else if (block) {
				return !isTopLevel();
			} else {
				return true;
			}
		}
		return false;
	}

	function shouldShowContentAfter() {
		if (getPropertyValue(data, Fmt.CONTENT_AFTER)) {
			if (isLiChild) {
				return false;
			} else if (block) {
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
			(isTopLevel() || hasStyle(data, 'force-sublevel-label')) &&
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
				<Wrapper condition={isLi} withElement="li">
					<DecoratedData
						data={arrayItem}
						depth={depth + 1}
						{showLabels}
						{block}
						{allowLinks}
						{allowFindLinks}
						{allowPopovers}
						{limit}
						{keyed}
						{suppressProperty}
						{isInsideLinkElement}
						isLiChild={isLi}
					/>
				</Wrapper>
			{/each}
		{:else}
			<Wrapper condition={isLi} withElement="li">
				{#if shouldShowContentBefore()}
					<span class={`${Fmt.CONTENT_BEFORE} ${getStyleClasses(data)}`}>
						{data[Fmt.CONTENT_BEFORE]}
					</span>
				{/if}
				{#if data[JsonLd.TYPE]}
					{@const link = getLink(data)}
					<svelte:element
						this={getElementType(data)}
						href={link}
						target={link && hasStyle(data, 'ext-link') ? '_blank' : null}
						data-type={data[JsonLd.TYPE]}
						class={getStyleClasses(data)}
						use:conditionalPopover={data}
					>
						<DecoratedData
							data={data[Fmt.DISPLAY]}
							depth={depth + 1}
							{showLabels}
							{block}
							{allowLinks}
							{allowFindLinks}
							{allowPopovers}
							{limit}
							{keyed}
							{suppressProperty}
							isInsideLinkElement={isInsideLinkElement || !!link}
						/>
					</svelte:element>
				{:else if data[JsonLd.VALUE]}
					<DecoratedData
						data={data[JsonLd.VALUE]}
						depth={depth + 1}
						{showLabels}
						{block}
						{allowLinks}
						{allowFindLinks}
						{allowPopovers}
						{keyed}
						{suppressProperty}
						{isInsideLinkElement}
					/>
				{:else if data[Fmt.DISPLAY]}
					<DecoratedData
						data={data[Fmt.DISPLAY]}
						depth={depth + 1}
						{showLabels}
						{block}
						{allowLinks}
						{allowFindLinks}
						{allowPopovers}
						{keyed}
						{suppressProperty}
						{isInsideLinkElement}
					/>
				{:else}
					{@const [propertyName, propertyData] = getProperty(data)}
					{#if propertyName && propertyData && (suppressProperty === undefined || !suppressProperty.includes(propertyName))}
						<!-- don't use 'show more' when exceeding limit by one -->
						{@const limitTo = limit?.[propertyName]}
						{@const delimited =
							limitTo && Array.isArray(propertyData) && propertyData.length > limitTo + 1}
						{@const elementType = getElementType(propertyData)}
						{@const hasUl = isUl(data, propertyData)}
						<svelte:element
							this={elementType}
							data-property={propertyName}
							class={[getStyleClasses(data), hasUl && 'ul']}
						>
							{#if shouldShowLabels() && typeof data[Fmt.LABEL] === 'string'}
								<svelte:element this={block ? 'div' : 'span'}>
									<!-- Add inner span with inline-block to achieve first letter capitalization while still supporting inline whitespaces -->
									<span class={['inline-block first-letter:capitalize', block && 'property-label']}>
										{data[Fmt.LABEL]}
									</span>
									<!-- eslint-disable-next-line svelte/no-useless-mustaches -->
									{' '}
								</svelte:element>
							{/if}
							{#if Fmt.HTML in data}
								<div class="markdown [&>p]:mb-2 [&>ul]:list-inside [&>ul]:list-disc">
									<!-- eslint-disable-next-line svelte/no-at-html-tags -->
									{@html propertyData}
								</div>
							{:else if hasUl}
								<ul data-property={propertyName}>
									<DecoratedData
										data={delimited && !delimitedShown
											? propertyData.slice(0, limitTo)
											: propertyData}
										depth={depth + 1}
										{showLabels}
										{block}
										{allowLinks}
										{allowFindLinks}
										{allowPopovers}
										{keyed}
										{suppressProperty}
										{isInsideLinkElement}
										isLi={true}
									/>
								</ul>
							{:else}
								<DecoratedData
									data={delimited && !delimitedShown
										? propertyData.slice(0, limitTo)
										: propertyData}
									depth={depth + 1}
									{showLabels}
									{block}
									{allowLinks}
									{allowFindLinks}
									{allowPopovers}
									{keyed}
									{suppressProperty}
									{isInsideLinkElement}
								/>
							{/if}
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
									<span class="delimiter"
										>{` +${propertyData.length - limitTo} ${page.data.t('general.more')}`}</span
									>
								{/if}
							{/if}
						</svelte:element>
					{/if}
				{/if}
				{#if shouldShowContentAfter()}
					<span class={`${Fmt.CONTENT_AFTER} ${getStyleClasses(data)}`}>
						{data[Fmt.CONTENT_AFTER]}
					</span>
				{/if}
			</Wrapper>
		{/if}
	{:else}
		<Wrapper condition={isLi} withElement="li">
			{data}
		</Wrapper>
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

	.transliteration {
		font-style: italic;
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
