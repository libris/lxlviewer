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
	} from '$lib/utils/resourceData';
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
		{#if parent === Elem.Dl}
			<dd>{data}</dd>
		{:else if parent === Elem.Ul}
			<li>{data}</li>
		{:else}
			{data}
		{/if}
	{/if}
{/snippet}

{#snippet wrapper(data: Node, parent: Parent, skip = false)}
	{const isBlock = amIBlock(data, parent)}
	{const styles = getComputedStyles(data, isBlock)}
	{const link = $derived(getLink(data))}
	{const target = $derived(link && hasStyle(data, 'ext-link') ? '_blank' : null)}
	{const label = $derived(getLabel(data))}
	{const prop = isPropertyNode(data) ? data[Fmt.PROP] : null}
	{const type = JsonLd.TYPE in data ? data[JsonLd.TYPE] : null}
	{const hasContent =
		!isHtmlNode(data) && (Fmt.CONTENT_BEFORE in data || Fmt.CONTENT_AFTER in data)}

	<!-- skip -->
	{#if skip}
		{@render node(data, parent)}
		<!-- suppress -->
	{:else if prop && suppressProperty?.includes(prop)}
		<!-- html -->
	{:else if isPropertyNode(data) && isHtmlNode(data[Fmt.VALUE])}
		{@render html(data[Fmt.VALUE])}
		<!-- dl -->
	{:else if label && isBlock && isPropertyNode(data)}
		{@render before(data, !isBlock)}
		<dl class={styles} data-property={prop} data-type={type}>
			<dt>
				{label}
			</dt>
			{@render node(data, Elem.Dl)}
		</dl>
		{@render after(data, !isBlock)}
	{:else if parent === Elem.Dl}
		<dd class={[!isBlock && 'inline', link ? '' : styles]} data-property={prop} data-type={type}>
			{@render before(data, !isBlock)}
			{#if link}
				{@render linkSnippet(data, link, target, styles)}
			{:else}
				{@render node(data, Elem.Dd)}
			{/if}
			{@render after(data, !isBlock)}
		</dd>
		<!-- ul -->
	{:else if !label && isBlock && isPropertyNode(data) && Array.isArray(data[Fmt.VALUE]) && data[Fmt.VALUE].length > 1}
		{@render before(data, !isBlock)}
		<ul class={styles} data-property={prop} data-type={type} aria-label={data[Fmt.LABEL]}>
			{@render node(data, Elem.Ul)}
		</ul>
		{@render after(data, !isBlock)}
	{:else if parent === Elem.Ul}
		<li class={[!isBlock && 'inline', link ? '' : styles]} data-property={prop} data-type={type}>
			{@render before(data, !isBlock)}
			{#if link}
				{@render linkSnippet(data, link, target, styles)}
			{:else}
				{@render node(data, Elem.Li)}
			{/if}
			{@render after(data, !isBlock)}
		</li>
		<!-- a -->
	{:else if link && parent !== Elem.A}
		{@render before(data, !isBlock)}
		{@render linkSnippet(data, link, target, styles)}
		{@render after(data, !isBlock)}
		<!-- p -->
	{:else if !label && isBlock}
		<p class={styles} data-property={prop} data-type={type}>
			{@render before(data, !isBlock)}
			{@render node(data, Elem.P)}
			{@render after(data, !isBlock)}
		</p>
	{:else if styles?.length || hasContent}
		{const forcedLabel = forceLabel(data)}
		<span class={styles} data-property={prop} data-type={type}>
			{#if forcedLabel}
				{forcedLabel}
			{/if}
			{@render before(data, !isBlock)}
			{@render node(data, parent)}
			{@render after(data, !isBlock)}
		</span>
	{:else}
		{@render node(data, parent)}
	{/if}
{/snippet}

{#snippet linkSnippet(data: Node, link: string, target: string | null, styles: Styles)}
	<a href={target ? link : resolve(link)} {target} class={styles} use:conditionalPopover={data}>
		{@render node(data, Elem.A)}
	</a>
{/snippet}

{#snippet node(data: Node, parent: Parent)}
	{#if typeof data === 'object' && !Array.isArray(data)}
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
	{/if}
{/snippet}

{#snippet before(data: Node, renderContent: boolean)}
	{#if renderContent && !isHtmlNode(data) && Fmt.CONTENT_BEFORE in data}
		{data[Fmt.CONTENT_BEFORE]}
	{/if}
{/snippet}

{#snippet after(data: Node, renderContent: boolean)}
	{#if renderContent && !isHtmlNode(data) && Fmt.CONTENT_AFTER in data}
		{data[Fmt.CONTENT_AFTER]}
	{/if}
{/snippet}

{#snippet html(data: HtmlNode)}
	<div class="markdown [&>p]:mb-2 [&>ul]:list-inside [&>ul]:list-disc">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html data[Fmt.HTML]}
	</div>
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

{@render traverse(data, parent, skipOuter)}

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
