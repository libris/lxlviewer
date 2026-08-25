<script lang="ts">
	import { page } from '$app/state';
	import { relativizeUrl, stripAnchor, trimSlashes } from '$lib/utils/http';
	import { resolve } from '$app/paths';
	import type { SuperSearchResultItem } from '$lib/types/search';
	import DecoratedData2 from '$lib/components/DecoratedData2.svelte';
	import { Elem, ShowLabelsOptions } from '$lib/types/decoratedData';
	import { LxlLens } from '$lib/types/display';
	import { Fmt, LensType } from '$lib/types/xl';
	import getInstanceData from '$lib/utils/getInstanceData';
	import SuggestionImage from './SuggestionImage.svelte';
	import type { Snippet } from 'svelte';
	import IconReturnKey from '~icons/bi/arrow-return-left';
	import IconAddQualifier from '~icons/bi/arrow-up-left';

	type Props = {
		item: SuperSearchResultItem;
		getCellId?: (cellIndex: number) => string;
		isFocusedRow?: () => boolean;
		isFocusedCell?: (cellIndex: number) => boolean;
		leadingContent?: Snippet;
	};

	const { item, getCellId, isFocusedRow, isFocusedCell, leadingContent }: Props = $props();
	const resourceId = $derived(stripAnchor(trimSlashes(relativizeUrl(item?.['@id']))));
	const primaryAddQualifierLink = $derived(item?.qualifiers?.[0]?._q || resourceId);

	const contribution = $derived.by(() => {
		if (typeof item[LxlLens.CardBody] === 'object' && Fmt.DISPLAY in item[LxlLens.CardBody]) {
			for (const i of item[LxlLens.CardBody][Fmt.DISPLAY]) {
				if (i[Fmt.PROP] === 'contribution') {
					return i;
				}
			}
		}
	});
</script>

{#snippet resourceSnippet(item: SuperSearchResultItem)}
	<div class="resource grid grid-cols-[40px_minmax(0,1fr)] items-center gap-2">
		<SuggestionImage {item} />
		<div class="resource-content">
			<h2 class="decorated-heading flex gap-1 overflow-hidden text-base whitespace-nowrap">
				<span class="truncate">
					<DecoratedData2
						data={item[LxlLens.CardHeading]}
						showLabels={ShowLabelsOptions.Never}
						allowPopovers={false}
						allowLinks={false}
						parent={Elem.Span}
						skipOuter={true}
					/>
				</span>
				<!-- only show body > contribution next to header -->
				{#if contribution}
					<span class="divider">{' · '}</span>
					<span class="suggestion-contribution truncate font-normal">
						<DecoratedData2
							data={contribution}
							showLabels={ShowLabelsOptions.Never}
							allowLinks={false}
							allowPopovers={false}
							limit={{ contribution: 1 }}
							parent={Elem.Span}
							skipOuter={false}
						/>
					</span>
				{/if}
			</h2>
			<footer class="resource-footer text-3xs text-subtle sm:text-2xs truncate">
				<span class="font-medium">
					{item.selectTypeStr}
				</span>
				{#if item.selectTypeStr}
					<span class="divider">{' · '}</span>
				{/if}
				<span class="font-medium">
					{item.typeStr}
				</span>
				{#if typeof item?.[LensType.WebCardHeaderTop] === 'object' && Fmt.DISPLAY in item[LensType.WebCardHeaderTop] && item[LensType.WebCardHeaderTop][Fmt.DISPLAY].length}
					<span class="divider">{' · '}</span>
					{#each item?.[LensType.WebCardHeaderTop][Fmt.DISPLAY] as header, index (`header-${index}`)}
						<DecoratedData2
							data={header}
							showLabels={ShowLabelsOptions.Never}
							allowLinks={false}
							allowPopovers={false}
							parent={Elem.Footer}
						/>
					{/each}
				{/if}
				{#if typeof item?.[LensType.WebCardFooter] === 'object' && Fmt.DISPLAY in item[LensType.WebCardFooter] && item[LensType.WebCardFooter][Fmt.DISPLAY].length}
					{#each item?.[LensType.WebCardFooter][Fmt.DISPLAY] as footer, index (`footer-${index}`)}
						{#if footer[Fmt.PROP] === 'hasInstance'}
							{@const instances = getInstanceData(footer[Fmt.VALUE])}
							{#if instances?.years}
								<span class="divider">{' · '}</span>
								<span class="editions">
									{#if instances.count > 1}
										{instances?.count}
										{page.data.t('search.editions')}
										{`(${instances.years})`}
									{:else}
										{instances.years}
									{/if}
								</span>
							{/if}
						{:else}
							<span class="divider">{' · '}</span>
							<DecoratedData2
								data={footer}
								showLabels={ShowLabelsOptions.Never}
								allowLinks={false}
								allowPopovers={false}
								parent={Elem.Footer}
								limit={{ editionStatement: 1, publication: 1, identifier: 1 }}
							/>
						{/if}
					{/each}
				{/if}
			</footer>
		</div>
	</div>
{/snippet}

<div
	class="suggestion flex h-13 sm:h-14 items-stretch rounded-md relative"
	class:qualifier={item.qualifiers?.length}
>
	{#if item.qualifiers?.length}
		<a
			href={resolve(page.data.localizeHref(primaryAddQualifierLink))}
			id={getCellId?.(0)}
			class={['mx-1 lg:mx-3 h-full rounded-md', isFocusedCell?.(0) && 'focused-cell']}
		>
			{@render resourceSnippet(item)}
		</a>
	{:else}
		<a
			href={resolve(page.data.localizeHref(resourceId))}
			id={getCellId ? getCellId(0) : ''}
			class={['mx-1 lg:mx-3 rounded-md', isFocusedCell?.(0) && 'focused-cell']}
			class:focused-cell={isFocusedCell?.(0)}
		>
			{@render leadingContent?.()}
			{@render resourceSnippet(item)}
		</a>
	{/if}
	{#if isFocusedRow?.()}
		<div
			class="absolute right-4.5 hidden sm:flex pointer-events-none h-full items-center bg-accent-100 justify-center w-12 rounded-r-md"
		>
			{#if item.qualifiers?.length}
				<IconAddQualifier class="text-link" aria-hidden="true" />
			{:else}
				<IconReturnKey
					class="text-link"
					aria-hidden={item.qualifiers?.length ? undefined : 'true'}
				/>
			{/if}
		</div>
	{/if}
</div>

<style lang="postcss">
	@reference "tailwindcss";

	.suggestion a {
		display: flex;
		align-items: center;
		text-decoration: none;
	}

	.suggestion a:first-child {
		flex: 1;
		text-align: left;
	}

	.qualifier.suggestion a:first-child {
		padding-right: 0;
	}

	.suggestion a:not(:first-child):last-child {
		text-align: right;
	}

	.suggestion .decorated-heading {
		& :global(.transliteration) {
			display: none;
		}

		& :global(.contribution-role) {
			display: none;
		}

		& :global(.delimiter) {
			color: var(--color-subtle);
		}
	}

	.suggestion-contribution {
		& :global(.person-extra) {
			display: none;
		}
	}
</style>
