<script lang="ts">
	// import DecoratedData2 from './DecoratedData2.svelte';
	import { Fmt, type DisplayDecorated, type ResourceNode, type PropertyNode } from '$lib/types/xl';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import { page } from '$app/state';
	// import popover from '$lib/actions/popover';
	import { hasStyle, getResourceId, getStyle } from '$lib/utils/resourceData';
	import { relativizeUrl, trimSlashes } from '$lib/utils/http';
	// import { getSupportedLocale } from '$lib/i18n/locales';
	// import Wrapper from './Wrapper.svelte';

	interface Props {
		data: DisplayDecorated;
		showLabels?: 'always' | 'never' | 'defaultOn' | 'defaultOff';
		allowLinks?: boolean;
		parent?: Parent;
		block?: boolean;
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
		showLabels = 'defaultOn',
		allowLinks = true,
		parent = undefined,
		block = false
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

	type Parent = 'dl' | 'a' | 'dd' | 'p' | 'h' | 'div' | 'span' | undefined;
	type Node = ResourceNode | PropertyNode;
	type Link = string | undefined;
	type Label = string | undefined;
	type Styles = string[] | undefined;

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
			case 'div':
				return true;
			default:
				return false;
		}
	}

	function isPropertyNode(data: Node): data is PropertyNode {
		return Fmt.PROP in data; // todo replace with PROP
	}

	function isBlock(data: Node, parent: Parent) {
		return (hasStyle(data, 'block') || block) && isBlockParent(parent);
	}
</script>

<!--
  @component
	Pass in parent to not render bad html, e.g `<p>` in `<p>`
-->

{#snippet traverse(data: DisplayDecorated, parent: Parent = undefined)}
	{#if typeof data === 'object'}
		{#if Array.isArray(data)}
			<!-- array -->
			{#each data as i, index (index)}
				{@render traverse(i, parent)}
			{/each}
		{:else}
			<!-- object -->
			{@render wrapper(data, parent)}
		{/if}
	{/if}
	{#if typeof data === 'string'}
		<!-- string -->
		{data}
	{/if}
{/snippet}

{#snippet wrapper(data: Node, parent: Parent)}
	{const styles: Styles = getStyle(data)}
	{const link: Link = getLink(data)}
	{const label = getLabel(data)}
	{#if label && isPropertyNode(data) && isBlockParent(parent)}
		<dl class={styles}>
			<dt class="first-letter:capitalize text-xs text-subtle">{label}</dt>
			{@render node(data, 'dl')}
		</dl>
	{:else if parent === 'dl'}
		<dd class={link ? '' : styles}>
			{#if link}
				<!-- todo link snippet -->
				<a href={link} data-parent={parent} class={styles}>
					{@render node(data, 'a')}
				</a>
			{:else}
				{@render node(data, 'dd')}
			{/if}
		</dd>
	{:else if link && parent !== 'a'}
		<a href={link} data-parent={parent} class={styles}>
			{@render node(data, 'a')}
		</a>
	{:else if !label && isBlockParent(parent)}
		<p class={styles}>
			{@render node(data, 'p')}
		</p>
	{:else if styles?.length}
		{#if isBlock(data, parent)}
			<div class={styles}>
				{@render node(data, 'div')}
			</div>
		{:else}
			<span class={styles}>
				{@render node(data, parent)}
			</span>
		{/if}
	{:else}
		{@render node(data, parent)}
	{/if}
{/snippet}

{#snippet node(data: Node, parent: Parent)}
	{#if typeof data === 'object' && !Array.isArray(data)}
		{@render before(data, parent)}
		{#if Fmt.DISPLAY in data}
			{@render traverse(data[Fmt.DISPLAY], parent)}
		{:else if Fmt.VALUE in data}
			{@render traverse(data[Fmt.VALUE], parent)}
		{/if}
		{@render after(data, parent)}
	{/if}
{/snippet}

<!-- {#snippet content(data, parent: Parent)}
	{const styles: Styles = getStyle(data)}
	{@render before(data, parent)}
	{#if data[Fmt.DISPLAY]}
		{const link = getLink(data)}
		{@render maybeLink(data[Fmt.DISPLAY], parent, link, styles)}
	{:else if data[Fmt.VALUE]}
		{const label = getLabel(data)}
		{@render wrapper(data[Fmt.VALUE], parent, label, styles)}
	{/if}
	{@render after(data, parent)}
{/snippet} -->

{#snippet before(data: Node, parent: Parent)}
	{#if data[Fmt.CONTENT_BEFORE] && !isBlockParent(parent) && !hasStyle(data, 'block')}
		{data[Fmt.CONTENT_BEFORE]}
	{/if}
{/snippet}

{#snippet after(data: Node, parent: Parent)}
	{#if data[Fmt.CONTENT_AFTER] && !isBlockParent(parent) && !hasStyle(data, 'block')}
		{data[Fmt.CONTENT_AFTER]}
	{/if}
{/snippet}

<!-- {#snippet wrapper(data, parent: Parent, label: Label = undefined, styles: Styles)}
	{#if label && !parent}
		<dl data-parent={parent} class={styles}>
			<dt class="first-letter:capitalize text-xs text-subtle">{label}</dt>
			<dd>{@render traverse(data, 'dd')}</dd>
		</dl>
	{:else if isBlockParent(parent)}
		<p data-parent={parent} class={styles}>
			{@render traverse(data, 'p')}
		</p>
	{:else if styles}
		{console.log('wrapper maybe lost style', styles)}
		{@render traverse(data, parent)}
	{:else}
		{@render traverse(data, parent)}
	{/if}
{/snippet} -->

<!-- {#snippet maybeLink(data, parent: Parent, link: Link, styles: Styles)}
	{#if link && parent !== 'a'}
		<a href={link} data-parent={parent} class={styles}>
			{@render traverse(data, 'a')}
		</a>
	{:else if styles}
		{console.log('maybeLink maybe lost style', styles)}
		{@render traverse(data, parent)}
	{:else}
		{@render traverse(data, parent)}
	{/if}
{/snippet} -->

{@render traverse(data, parent)}
