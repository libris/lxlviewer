<script lang="ts">
	// import DecoratedData2 from './DecoratedData2.svelte';
	import { Fmt } from '$lib/types/xl';
	import type { ResourceData } from '$lib/types/resourceData';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import { page } from '$app/state';
	// import popover from '$lib/actions/popover';
	import { hasStyle, getResourceId } from '$lib/utils/resourceData';
	import { relativizeUrl, trimSlashes } from '$lib/utils/http';
	// import { getSupportedLocale } from '$lib/i18n/locales';
	// import Wrapper from './Wrapper.svelte';

	interface Props {
		data: ResourceData;
		showLabels?: 'always' | 'never' | 'defaultOn' | 'defaultOff';
		allowLinks?: boolean;
		parent?: Parent;
		// depth?: number;
		// allowPopovers?: boolean; // used for preventing nested popovers
		// allowFindLinks?: boolean;
		// block?: boolean;
		// limit?: Record<string, number>;
		// keyed?: boolean;
		// suppressProperty?: string[];
		// isInsideLinkElement?: boolean;
		// isLi?: boolean;
		// isLiChild: boolean;
	}

	let {
		data,
		showLabels = 'defaultOn',
		allowLinks = true,
		parent = undefined
		// depth = 0,
		// allowPopovers = true,
		// allowFindLinks = false,
		// block = false,
		// limit = undefined,
		// keyed = true,
		// suppressProperty = undefined,
		// isInsideLinkElement = false,
		// isLi = false,
		// isLiChild = false
	}: Props = $props();

	type Parent = 'dl' | 'a' | 'dd' | 'p' | 'h' | undefined;
	type Link = string | undefined;
	type Label = string | undefined;

	function getLink(data: ResourceData): string | undefined {
		if (allowLinks && hasStyle(data, 'link')) {
			const id = trimSlashes(relativizeUrl(getResourceId(data)));
			const linkToSelf = `/${id}` === page.url.pathname;
			if (id && !linkToSelf) {
				return page.data.localizeHref(id);
			}
		}
	}

	function getLabel(data): Label | undefined {
		if (
			// (isTopLevel() || hasStyle(data, 'force-sublevel-label')) &&
			showLabels === ShowLabelsOptions.Always ||
			(showLabels === ShowLabelsOptions.DefaultOn && !hasStyle(data, 'nolabel')) ||
			(showLabels === ShowLabelsOptions.DefaultOff && hasStyle(data, 'label'))
		) {
			return data[Fmt.LABEL] ?? undefined;
		}
	}
</script>

{#snippet traverse(data, parent: Parent = undefined)}
	{#if typeof data === 'object'}
		{#if Array.isArray(data)}
			<!-- array -->
			{#each data as i, index (index)}
				{@render traverse(i, parent)}
			{/each}
		{:else}
			<!-- object -->
			{@render content(data, parent)}
		{/if}
	{/if}
	{#if typeof data === 'string'}
		<!-- string -->
		{data}
	{/if}
{/snippet}

{#snippet content(data, parent: Parent)}
	{@render before(data)}
	{#if data[Fmt.DISPLAY]}
		{const link = getLink(data)}
		{@render maybeLink(data[Fmt.DISPLAY], parent, link)}
	{:else if data[Fmt.VALUE]}
		{@const label = getLabel(data)}
		{@render wrapper(data[Fmt.VALUE], parent, label)}
	{/if}
	{@render after(data)}
{/snippet}

{#snippet before(data)}
	{#if data[Fmt.CONTENT_BEFORE]}
		{data[Fmt.CONTENT_BEFORE]}
	{/if}
{/snippet}

{#snippet after(data)}
	{#if data[Fmt.CONTENT_AFTER]}
		{data[Fmt.CONTENT_AFTER]}
	{/if}
{/snippet}

{#snippet wrapper(data, parent: Parent, label: Label = undefined)}
	{#if label && !parent}
		<dl data-parent={parent}>
			<dt class="first-letter:capitalize text-xs text-subtle">{label}</dt>
			<dd>{@render traverse(data, 'dd')}</dd>
		</dl>
	{:else if !parent}
		<p data-parent={parent}>
			{@render traverse(data, 'p')}
		</p>
	{:else}
		{@render traverse(data, parent)}
	{/if}
{/snippet}

{#snippet maybeLink(data, parent: Parent, link: Link)}
	{#if link && parent !== 'a'}
		<!-- eslint-disable svelte/no-navigation-without-resolve -->
		<a href={link} data-parent={parent} class="link">
			{@render traverse(data, 'a')}
		</a>
	{:else}
		{@render traverse(data, parent)}
	{/if}
{/snippet}

{@render traverse(data, parent)}
