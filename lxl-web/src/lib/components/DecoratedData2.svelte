<script lang="ts">
	import {
		Fmt,
		type DisplayDecorated,
		type ResourceNode,
		type PropertyNode,
		JsonLd
	} from '$lib/types/xl';
	import { Elem, ShowLabelsOptions } from '$lib/types/decoratedData';
	import { page } from '$app/state';
	// import popover from '$lib/actions/popover';
	import { hasStyle, getResourceId, getStyle } from '$lib/utils/resourceData';
	import { relativizeUrl, trimSlashes } from '$lib/utils/http';
	// import { getSupportedLocale } from '$lib/i18n/locales';

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
		// depth?: number;
		// allowPopovers?: boolean; // used for preventing nested popovers
		// allowFindLinks?: boolean;
		// limit?: Record<string, number>;
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
		skipOuter = false
		// depth = 0,
		// allowPopovers = true,
		// allowFindLinks = false,
		// limit = undefined,
		// keyed = true,
		// suppressProperty = undefined,
		// isInsideLinkElement = false,
		// isLi = false,
		// isLiChild = false
	}: Props = $props();

	const skip = $derived(skipOuter);

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
			hasStyle(data, 'force-sublevel-label') ||
			showLabels === ShowLabelsOptions.Always ||
			(showLabels === ShowLabelsOptions.DefaultOn && !hasStyle(data, 'nolabel')) ||
			(showLabels === ShowLabelsOptions.DefaultOff && hasStyle(data, 'label'))
		) {
			return data[Fmt.LABEL] ?? undefined;
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

	function isPropertyNode(data: Node): data is PropertyNode {
		return Fmt.PROP in data;
	}

	function isBlock(data: Node, parent: Parent) {
		return (hasStyle(data, 'block') || block) && isBlockParent(parent);
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
	{const link: Link = getLink(data)}
	{const label = getLabel(data)}
	{const prop = Fmt.PROP in data ? data[Fmt.PROP] : null}
	{const type = JsonLd.TYPE in data ? data[JsonLd.TYPE] : null}

	{#if skip}
		{@render node(data, parent)}
	{:else if label && isPropertyNode(data) && isBlockParent(parent)}
		<dl class={[styles, 'mb-2']} data-prop={prop} data-type={type}>
			<dt class="first-letter:capitalize text-xs text-subtle">
				{label}
			</dt>
			{@render node(data, Elem.Dl, true)}
		</dl>
	{:else if parent === Elem.Dl}
		{const inline = !isBlock(data, parent)}
		<dd class={[link ? '' : styles, inline && 'inline']} data-prop={prop} data-type={type}>
			{#if link}
				<!-- eslint-disable svelte/no-navigation-without-resolve -->
				<a href={link} data-parent={parent} class={styles}>
					{@render node(data, Elem.A, !inline)}
				</a>
			{:else}
				{@render node(data, Elem.Dd, !inline)}
			{/if}
		</dd>
	{:else if link && parent !== Elem.A}
		<a href={link} data-parent={parent} class={styles} data-prop={prop} data-type={type}>
			{@render node(data, Elem.A)}
		</a>
	{:else if !label && isBlockParent(parent)}
		<p class={styles} data-prop={prop} data-type={type}>
			{@render node(data, Elem.P, true)}
		</p>
	{:else if styles?.length}
		{#if isBlock(data, parent)}
			<div class={styles} data-prop={prop} data-type={type}>
				{@render node(data, Elem.Div)}
			</div>
		{:else}
			<span class={styles} data-prop={prop} data-type={type}>
				{@render node(data, parent)}
			</span>
		{/if}
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
			{@render traverse(data[Fmt.VALUE], parent, false)}
		{/if}
		{@render content(Fmt.CONTENT_AFTER, data, parent, skipContent)}
	{/if}
{/snippet}

{#snippet content(
	placement: Fmt.CONTENT_BEFORE | Fmt.CONTENT_AFTER,
	data: Node,
	parent: Parent,
	skipContent: boolean
)}
	{#if placement in data && !hasStyle(data, 'block')}
		{#if !skipContent}
			{#if isPropertyNode(data)}
				<span class="bg-[green] text-[white]" data-parent={parent}>
					{data[placement]}
				</span>
			{:else}
				<span class="bg-[yellow]" data-parent={parent}>
					{data[placement]}
				</span>
			{/if}
		{:else}
			<span class="bg-[red] text-[white]" data-parent={parent}>
				{data[placement]}
			</span>
		{/if}
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
</style>
