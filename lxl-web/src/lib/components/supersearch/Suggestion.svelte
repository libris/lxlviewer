<script lang="ts">
	import { page } from '$app/state';
	import { relativizeUrl, stripAnchor, trimSlashes } from '$lib/utils/http';
	import { resolve } from '$app/paths';
	import type { SuperSearchResultItem } from '$lib/types/search';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import { LxlLens } from '$lib/types/display';
	import { LensType } from '$lib/types/xl';
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
</script>

{#snippet resourceSnippet(item: SuperSearchResultItem)}
	<div class="resource grid grid-cols-[40px_minmax(0,1fr)] items-center gap-2 px-1 lg:px-0">
		<SuggestionImage {item} />
		<div class="resource-content">
			<h2 class="decorated-heading flex gap-1 overflow-hidden text-base whitespace-nowrap">
				<span class="truncate">
					<DecoratedData
						data={item[LxlLens.CardHeading]}
						showLabels={ShowLabelsOptions.Never}
						allowPopovers={false}
						allowLinks={false}
					/>
				</span>
				<!-- only show body > contribution next to header header -->
				{#if item[LxlLens.CardBody]?._display?.[0]?.contribution}
					<span class="divider">{' · '}</span>
					<span class="suggestion-contribution truncate font-normal">
						<DecoratedData
							data={item[LxlLens.CardBody]?._display[0]}
							showLabels={ShowLabelsOptions.Never}
							allowLinks={false}
							allowPopovers={false}
							depth={-1}
							limit={{ contribution: 1 }}
						/>
					</span>
				{/if}
			</h2>
			<div class="resource-footer text-3xs text-subtle sm:text-2xs truncate">
				<span class="font-medium">
					{item.selectTypeStr}
				</span>
				{#if item.selectTypeStr}
					<span class="divider">{' · '}</span>
				{/if}
				<span class="font-medium">
					{item.typeStr}
				</span>
				{#if item.typeStr?.length}
					<span class="divider">{' · '}</span>
				{/if}
				{#each item?.[LensType.WebCardHeaderTop]?._display as header, index (`header-${index}`)}
					<DecoratedData
						data={header}
						showLabels={ShowLabelsOptions.Never}
						allowLinks={false}
						allowPopovers={false}
					/>
				{/each}
				{#if item.typeStr?.length}
					<span class="divider">{' · '}</span>
				{/if}
				{#each item?.[LensType.WebCardFooter]?._display as footer, index (`footer-${index}`)}
					{#if 'hasInstance' in footer}
						{@const instances = getInstanceData(footer.hasInstance)}
						{#if instances?.years}
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
						<DecoratedData
							data={footer}
							showLabels={ShowLabelsOptions.Never}
							allowLinks={false}
							allowPopovers={false}
						/>
					{/if}
				{/each}
			</div>
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

		& :global([data-property='contribution'] > *::after) {
			content: ', ';
		}

		/* hide last comma */
		& :global([data-property='contribution'] > *:last-child::after) {
			content: '';
		}

		/* hide comma before delimiter */
		& :global([data-property='contribution'] > *:has(+ .delimiter)::after) {
			content: '';
		}
	}

	.resource-footer {
		/* hide dangling divider · */
		& :global(.divider:not(:has(+ span:not(.divider)))) {
			display: none;
		}
	}
</style>
