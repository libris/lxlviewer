<script lang="ts">
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import {
		Fmt,
		type DisplayDecorated,
		type ResourceNode,
		type PropertyNode,
		JsonLd,
		type HtmlNode
	} from '$lib/types/xl';
	import { Elem, ShowLabelsOptions } from '$lib/types/decoratedData';
	import popover from '$lib/actions/popover';
	import {
		hasStyle,
		getResourceId,
		getStyle,
		isPropertyNode,
		isHtmlNode
	} from '$lib/utils/resourceData'; // todo rename
	import { relativizeUrl, trimSlashes } from '$lib/utils/http';
	import { getSupportedLocale } from '$lib/i18n/locales';

	type Parent = Elem | undefined;
	type Node = ResourceNode | PropertyNode | HtmlNode;
	type Link = string | undefined;
	type Label = string | undefined;
	type Styles = string[] | undefined;

	interface Props {
		data: DisplayDecorated | DisplayDecorated[];
		showLabels?: ShowLabelsOptions;
		allowLinks?: boolean;
		parent?: Parent; // Pass in parent to not render bad html, e.g `<p>` in `<p>`
		block?: boolean;
		skipOuter?: boolean; // Do not render an element from the outermost node, i.e. in the case of a work 'wrapper'
		allowPopovers?: boolean; // used for preventing nested popovers
		allowFindLinks?: boolean;
		limit?: Record<string, number>;
		suppressProperty?: string[];
	}

	let {
		data,
		showLabels = ShowLabelsOptions.DefaultOn,
		allowLinks = true,
		parent = undefined,
		block = false,
		skipOuter = false,
		allowPopovers = true,
		allowFindLinks = false,
		limit = undefined,
		suppressProperty = undefined
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

	function getLink(data: Node): Link {
		if (!allowLinks) return undefined;
		if (hasStyle(data, 'link')) {
			const id = trimSlashes(relativizeUrl(getResourceId(data)));
			const linkToSelf = `/${id}` === page.url.pathname;
			if (id && !linkToSelf) {
				return page.data.localizeHref(id);
			}
		}
		if (hasStyle(data, 'ext-link')) {
			const id = getResourceId(data);
			if (id) {
				return id;
			}
		}
		if (allowFindLinks && hasStyle(data, 'find-link') && Fmt.FIND_LINK in data) {
			return data[Fmt.FIND_LINK];
		}
	}

	function getComputedStyles(data: Node, isBlock: boolean): Styles {
		const styles = getStyle(data);
		return styles?.filter((s) => {
			if (s === 'block' && !isBlock) return false; // don't just blindly apply 'block'
			return true;
		});
	}

	function getLabel(data: Node): Label {
		if (isHtmlNode(data)) return undefined;
		if (
			showLabels === ShowLabelsOptions.Always ||
			(showLabels === ShowLabelsOptions.DefaultOn && !hasStyle(data, 'nolabel')) ||
			(showLabels === ShowLabelsOptions.DefaultOff && hasStyle(data, 'label'))
		) {
			return data[Fmt.LABEL] ?? undefined;
		}
	}

	function forceLabel(data: Node) {
		if (isHtmlNode(data)) return undefined;
		return hasStyle(data, 'force-sublevel-label') ? data[Fmt.LABEL] : undefined;
	}

	function conditionalPopover(node: HTMLElement, data: DisplayDecorated) {
		if (allowPopovers && !hasStyle(data, 'ext-link')) {
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

	function amIBlock(data: Node, parent: Parent): boolean {
		if (!parent || parent === Elem.Div) {
			return true;
		}
		if ((parent === Elem.Ul || parent === Elem.Dl) && (block || hasStyle(data, 'block'))) {
			return true;
		}
		return false;
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
	{const isBlock = amIBlock(data, parent)}
	{const styles: Styles = getComputedStyles(data, isBlock)}
	{const link: Link = $derived(getLink(data))}
	{const target = $derived(link && hasStyle(data, 'ext-link') ? '_blank' : null)}
	{const label = $derived(getLabel(data))}
	{const prop = Fmt.PROP in data ? data[Fmt.PROP] : null}
	{const type = JsonLd.TYPE in data ? data[JsonLd.TYPE] : null}

	{#if skip}
		{@render node(data, parent)}
		<!-- exit -->
	{:else if prop && suppressProperty && suppressProperty.includes(prop)}
		<!-- html -->
	{:else if isPropertyNode(data) && isHtmlNode(data[Fmt.VALUE])}
		<div class="markdown [&>p]:mb-2 [&>ul]:list-inside [&>ul]:list-disc">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html data[Fmt.VALUE][Fmt.HTML]}
		</div>
		<!-- dl -->
	{:else if label && isBlock && isPropertyNode(data)}
		<dl class={styles} data-property={prop} data-type={type}>
			<dt>
				{label}
			</dt>
			{@render node(data, Elem.Dl, !isBlock)}
		</dl>
	{:else if parent === Elem.Dl}
		<dd class={[!isBlock && 'inline', link ? '' : styles]} data-property={prop} data-type={type}>
			{#if link}
				<a
					href={target ? link : resolve(link)}
					{target}
					class={styles}
					use:conditionalPopover={data}
				>
					{@render node(data, Elem.A, !isBlock)}
				</a>
			{:else}
				{@render node(data, Elem.Dd, !isBlock)}
			{/if}
		</dd>
		<!-- ul -->
	{:else if !label && isBlock && isPropertyNode(data) && Array.isArray(data._value) && data._value.length > 1}
		<ul class={styles} data-property={prop} data-type={type} aria-label={data._label}>
			{@render node(data, Elem.Ul, !isBlock)}
		</ul>
	{:else if parent === Elem.Ul}
		<li class={[!isBlock && 'inline', link ? '' : styles]} data-property={prop} data-type={type}>
			{#if link}
				<a
					href={target ? link : resolve(link)}
					{target}
					class={styles}
					use:conditionalPopover={data}
				>
					{@render node(data, Elem.A, !isBlock)}
				</a>
			{:else}
				{@render node(data, Elem.Li, !isBlock)}
			{/if}
		</li>
		<!-- a -->
	{:else if link && parent !== Elem.A}
		<a
			href={target ? link : resolve(link)}
			class={styles}
			data-property={prop}
			{target}
			data-type={type}
			use:conditionalPopover={data}
		>
			{@render node(data, Elem.A)}
		</a>
		<!-- a -->
	{:else if !label && isBlock}
		<p class={styles} data-property={prop} data-type={type}>
			{@render node(data, Elem.P, false)}
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

{#snippet node(data: Node, parent: Parent, renderContent: boolean = true)}
	{#if typeof data === 'object' && !Array.isArray(data)}
		{@render content(Fmt.CONTENT_BEFORE, data, renderContent)}
		{#if JsonLd.VALUE in data && typeof data[JsonLd.VALUE] === 'string'}
			{data[JsonLd.VALUE]}
		{:else if Fmt.DISPLAY in data}
			{@render traverse(data[Fmt.DISPLAY], parent, false)}
		{:else if Fmt.VALUE in data}
			{const hasLimit = limit && limit?.[data[Fmt.PROP]]}
			{const showDelimiter =
				!!hasLimit && Array.isArray(data[Fmt.VALUE]) && data[Fmt.VALUE].length > hasLimit + 1}
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
		{@render content(Fmt.CONTENT_AFTER, data, renderContent)}
	{/if}
{/snippet}

<!-- eslint-disable @typescript-eslint/no-unused-vars -->
{#snippet content(
	placement: Fmt.CONTENT_BEFORE | Fmt.CONTENT_AFTER,
	data: Node,
	renderContent: boolean
)}
	{#if placement in data}
		{#if !isHtmlNode(data) && renderContent}
			{data[placement]}
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
	.transliteration {
		font-style: italic;
	}

	dl.ul dd,
	dl.ul-when-multiple:has(dd + dd) dd {
		display: list-item;
		list-style-type: disc;
		margin-left: 1rem;

		&::marker {
			color: var(--color-subtle);
		}
	}

	.force-sublevel-label {
		/* make text-transform work */
		display: inline-block;
	}

	dl::first-letter,
	.force-sublevel-label::first-letter {
		text-transform: uppercase;
	}
</style>
