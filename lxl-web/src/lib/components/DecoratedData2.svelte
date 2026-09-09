<script lang="ts">
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import {
		Fmt,
		type DisplayDecorated,
		type ResourceNode,
		type PropertyNode,
		JsonLd
	} from '$lib/types/xl';
	import { Elem, ShowLabelsOptions } from '$lib/types/decoratedData';
	import popover from '$lib/actions/popover';
	import { hasStyle, getResourceId, getStyle, isPropertyNode } from '$lib/utils/resourceData'; // todo rename
	import { relativizeUrl, trimSlashes } from '$lib/utils/http';
	import { getSupportedLocale } from '$lib/i18n/locales';

	type Parent = Elem | undefined;
	type Node = ResourceNode | PropertyNode;
	type Link = string | undefined;
	type Label = string | undefined;
	type Styles = string[] | undefined;

	interface Props {
		data: DisplayDecorated | DisplayDecorated[];
		showLabels?: ShowLabelsOptions;
		allowLinks?: boolean;
		parent?: Parent; // Pass in parent to not render bad html, e.g `<p>` in `<p>`
		block?: boolean;
		skipOuter?: boolean; // Do not render an element from the outermost node, i.e. in the case of a complete linked work
		allowPopovers?: boolean; // used for preventing nested popovers
		limit?: Record<string, number>;
		// depth?: number;
		// allowFindLinks?: boolean;
		// keyed?: boolean;
		// suppressProperty?: string[];
		// isInsideLinkElement?: boolean;
		// isLi?: boolean;
		// isLiChild: boolean;
	}

	let {
		data,
		showLabels = ShowLabelsOptions.DefaultOn,
		allowLinks = true,
		parent = undefined,
		block = false,
		skipOuter = false,
		allowPopovers = true,
		limit = undefined
		// depth = 0,
		// allowFindLinks = false,
		// keyed = true,
		// suppressProperty = undefined,
		// isInsideLinkElement = false,
		// isLi = false,
		// isLiChild = false
	}: Props = $props();

	let skip = $derived(skipOuter);
	let limitState = $state(
		untrack(
			() =>
				limit &&
				Object.fromEntries(
					Object.entries(limit).map(([key, value]) => [key, { limit: value, expanded: false }])
				)
		)
	);

	function getLink(data: DisplayDecorated): Link {
		if (allowLinks && hasStyle(data, 'link')) {
			const id = trimSlashes(relativizeUrl(getResourceId(data)));
			const linkToSelf = `/${id}` === page.url.pathname;
			if (id && !linkToSelf) {
				return page.data.localizeHref(id);
			}
		}
	}

	function getLabel(data: Node): Label {
		if (
			showLabels === ShowLabelsOptions.Always ||
			(showLabels === ShowLabelsOptions.DefaultOn && !hasStyle(data, 'nolabel')) ||
			(showLabels === ShowLabelsOptions.DefaultOff && hasStyle(data, 'label'))
		) {
			return data[Fmt.LABEL] ?? undefined;
		}
	}

	function forceLabel(data: Node) {
		return hasStyle(data, 'force-sublevel-label') ? data[Fmt.LABEL] : undefined;
	}

	function conditionalPopover(node: HTMLElement, data: DisplayDecorated) {
		if (allowPopovers) {
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

	function isBlockParent(parent: Parent): boolean {
		if (!parent) return true;
		switch (parent) {
			case Elem.Div:
			case Elem.Dl:
				return true;
			default:
				return false;
		}
	}

	function isBlock(data: Node, parent: Parent) {
		return (hasStyle(data, 'block') || block) && isBlockParent(parent);
	}

	function delimiterWrapper(parent: Parent) {
		switch (parent) {
			case Elem.Ul:
				return Elem.Li;
			case Elem.Dl:
				return Elem.Dd;
			default:
				return Elem.Span;
		}
	}
</script>

{#snippet traverse(data: DisplayDecorated | DisplayDecorated[], parent: Parent, skip: boolean)}
	{#if typeof data === 'object'}
		{#if Array.isArray(data)}
			<!-- array -->
			{#each data as i, index (index)}
				{@render traverse(i, parent, skip)}
			{/each}
		{:else}
			<!-- object -->
			{@render wrapper(data, parent, skip)}
		{/if}
	{/if}
	{#if typeof data === 'string'}
		<!-- string -->
		{data}
	{/if}
{/snippet}

{#snippet wrapper(data: Node, parent: Parent, skip?: boolean)}
	{const styles: Styles = getStyle(data)}
	{const link: Link = $derived(getLink(data))}
	{const label = $derived(getLabel(data))}
	{const prop = Fmt.PROP in data ? data[Fmt.PROP] : null}
	{const type = JsonLd.TYPE in data ? data[JsonLd.TYPE] : null}
	{const inline = !isBlock(data, parent)}

	{#if skip}
		{@render node(data, parent)}
		<!-- dl -->
	{:else if label && isPropertyNode(data) && isBlockParent(parent)}
		<dl class={styles} data-property={prop} data-type={type}>
			<dt>
				{label}
			</dt>
			{@render node(data, Elem.Dl, true)}
		</dl>
	{:else if parent === Elem.Dl}
		<dd class={[inline && 'inline', link ? '' : styles]} data-property={prop} data-type={type}>
			{#if link}
				<a href={resolve(link)} data-parent={parent} class={styles} use:conditionalPopover={data}>
					{@render node(data, Elem.A, !inline)}
				</a>
			{:else}
				{@render node(data, Elem.Dd, !inline)}
			{/if}
		</dd>
		<!-- ul -->
	{:else if !label && isPropertyNode(data) && Array.isArray(data._value) && data._value.length > 1 && isBlockParent(parent)}
		<ul class={styles} data-property={prop} data-type={type} aria-label={data._label}>
			{@render node(data, Elem.Ul, !inline)}
		</ul>
	{:else if parent === Elem.Ul}
		<li class={[link ? '' : styles]} data-property={prop} data-type={type}>
			{#if link}
				<!-- eslint-disable svelte/no-navigation-without-resolve -->
				<a href={resolve(link)} data-parent={parent} class={styles} use:conditionalPopover={data}>
					{@render node(data, Elem.A, !inline)}
				</a>
			{:else}
				{@render node(data, Elem.Li, !inline)}
			{/if}
		</li>
		<!-- a -->
	{:else if link && parent !== Elem.A}
		<a
			href={resolve(link)}
			data-parent={parent}
			class={styles}
			data-property={prop}
			data-type={type}
			use:conditionalPopover={data}
		>
			{@render node(data, Elem.A)}
		</a>
	{:else if !label && isBlockParent(parent)}
		<p class={styles} data-property={prop} data-type={type}>
			{@render node(data, Elem.P, true)}
		</p>
	{:else if styles?.length}
		{const forcedLabel = forceLabel(data)}
		<span class={styles} data-property={prop} data-type={type}>
			{#if forcedLabel}{forcedLabel}{/if}{@render node(data, parent)}
		</span>
	{:else}
		{@render node(data, parent)}
	{/if}
{/snippet}

{#snippet node(data: Node, parent: Parent, skipContent: boolean = false)}
	{#if typeof data === 'object' && !Array.isArray(data)}
		{@render content(Fmt.CONTENT_BEFORE, data, parent, skipContent)}
		{#if Fmt.DISPLAY in data}
			{@render traverse(data[Fmt.DISPLAY], parent, false)}
		{:else if Fmt.VALUE in data}
			{const hasLimit = limit && limit?.[data[Fmt.PROP]]}
			{const showDelimiter =
				!!hasLimit && Array.isArray(data[Fmt.VALUE]) && data[Fmt.VALUE].length > hasLimit}
			{#if showDelimiter && Array.isArray(data[Fmt.VALUE])}
				<!-- show delimiter  -->
				{const expanded = $derived(limitState && limitState[data[Fmt.PROP]].expanded)}
				{@render traverse(
					expanded ? data[Fmt.VALUE] : data[Fmt.VALUE].slice(0, hasLimit),
					parent,
					false
				)}
				{@render delimiter(data, parent, hasLimit)}
			{:else}
				{@render traverse(data[Fmt.VALUE], parent, false)}
			{/if}
		{/if}
		{@render content(Fmt.CONTENT_AFTER, data, parent, skipContent)}
	{/if}
{/snippet}

<!-- eslint-disable @typescript-eslint/no-unused-vars -->
{#snippet content(
	placement: Fmt.CONTENT_BEFORE | Fmt.CONTENT_AFTER,
	data: Node,
	parent: Parent,
	skipContent: boolean
)}
	{#if placement in data && !hasStyle(data, 'block')}
		{#if !skipContent}
			{data[placement]}
			<!-- {#if isPropertyNode(data)}
				<span class="bg-[green] text-[white]" data-parent={parent}>
					{data[placement]}
				</span>
			{:else}
				<span class="bg-[yellow]" data-parent={parent}>
					{data[placement]}
				</span>
			{/if} -->
		{:else}
			<!-- <span class="bg-[red] text-[white]" data-parent={parent}>
				{data[placement]}
			</span> -->
		{/if}
	{/if}
{/snippet}

{#snippet delimiter(data: PropertyNode, parent: Parent, limit: number)}
	{#if limitState}
		{const remainder = Array.isArray(data[Fmt.VALUE]) ? data[Fmt.VALUE].length - limit : 0}
		{const prop = data[Fmt.PROP]}
		<svelte:element this={delimiterWrapper(parent)}>
			{#if allowLinks}
				{@const delimitText = limitState[prop].expanded
					? page.data.t('search.showFewer')
					: `${page.data.t('search.showMore')} (+${remainder})`}
				<button
					class="delimiter link-subtle"
					type="button"
					onclick={() => (limitState[prop].expanded = !limitState[prop].expanded)}
					>{delimitText}</button
				>
			{:else}
				<span class="delimiter">{` +${remainder} ${page.data.t('general.more')}`}</span>
			{/if}
		</svelte:element>
	{/if}
{/snippet}

{@render traverse(data, parent, skip)}

<style lang="postcss">
	dl.ul dd,
	dl.ul-when-multiple:has(+ dd + dd) dd {
		display: list-item;
		list-style-type: disc;
		margin-left: 1rem;

		&::marker {
			color: var(--color-subtle);
		}
	}

	dl::first-letter,
	.force-sublevel-label::first-letter {
		text-transform: uppercase;
	}
</style>
