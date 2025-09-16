<script lang="ts">
	import { page } from '$app/state';
	import { relativizeUrl, trimSlashes } from '$lib/utils/http';
	import type { SuperSearchResultItem } from '$lib/types/search';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import { LxlLens } from '$lib/types/display';
	import { LensType } from '$lib/types/xl';
	import getInstanceData from '$lib/utils/getInstanceData';
	import SuggestionImage from './SuggestionImage.svelte';
	import MoreIcon from '~icons/bi/three-dots';
	import dropdownMenu from '$lib/actions/dropDownMenu/index.svelte.js';

	type Props = {
		item: SuperSearchResultItem;
		getCellId: (cellIndex: number) => string;
		isFocusedCell: (cellIndex: number) => boolean;
	};

	const { item, getCellId, isFocusedCell }: Props = $props();
	const resourceId = $derived(trimSlashes(relativizeUrl(item?.['@id'])));
	const primaryAddQualifierLink = $derived(item.qualifiers?.[0]?._q || resourceId);
</script>

{#snippet resourceSnippet(item: SuperSearchResultItem)}
	{#if item.qualifiers.length}
		<span
			class="text-subtle order-1 ml-auto hidden rounded-sm px-1.5 py-0.5 text-xs whitespace-nowrap sm:inline"
		>
			{page.data.t('search.add')}

			<span class="hidden lowercase lg:inline">
				{item.qualifiers[0].label}
			</span>
		</span>
	{:else}
		<div class="sr-only">{page.data.t('search.goTo')}</div>
	{/if}
	<div class="resource grid grid-cols-[40px_minmax(0,_1fr)] items-center gap-2">
		<SuggestionImage {item} />
		<div class="resource-content">
			<hgroup
				class="resource-heading grid gap-1 overflow-hidden text-xs font-medium whitespace-nowrap"
			>
				<h2 class="truncate">
					<DecoratedData
						data={item[LxlLens.CardHeading]}
						showLabels={ShowLabelsOptions.Never}
						allowPopovers={false}
						allowLinks={false}
					/>
				</h2>
				{#if item[LxlLens.CardBody]?._display?.[0]}
					<p class="truncate">
						<span class="divider">{' · '}</span>
						<DecoratedData
							data={item[LxlLens.CardBody]?._display[0]}
							showLabels={ShowLabelsOptions.Never}
							allowLinks={false}
							allowPopovers={false}
						/>
					</p>
				{/if}
			</hgroup>
			<div class="resource-footer text-3xs text-subtle truncate">
				<strong class="font-medium">
					{item.typeStr}
				</strong>
				{#if item.typeStr?.length}
					<span class="divider">{' · '}</span>
				{/if}
				{#each item?.[LensType.WebCardFooter]?._display as obj, index (index)}
					{#if 'hasInstance' in obj}
						{@const instances = getInstanceData(obj.hasInstance)}
						{#if instances?.years}
							<span class="divider">{' · '}</span>
							<span>
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
							data={obj}
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

<div class="suggestion flex h-14 items-stretch" class:qualifier={item.qualifiers.length}>
	{#if item.qualifiers.length}
		<a
			href={page.data.localizeHref(primaryAddQualifierLink)}
			id={getCellId(0)}
			class:focused-cell={isFocusedCell(0)}
		>
			{@render resourceSnippet(item)}
		</a>
		<button
			type="button"
			class="more w-14 items-center justify-center p-0"
			id={getCellId(1)}
			class:focused-cell={isFocusedCell(1)}
		>
			{#key item.qualifiers}
				<span
					class="more-icon-container text-subtle flex size-10 items-center justify-center rounded-full"
					use:dropdownMenu={{
						menuItems: [
							...item.qualifiers.map((qualifier) => ({
								label: `${page.data.t('search.addAs')} ${qualifier.label.toLocaleLowerCase()}`,
								href: qualifier._q
							})),
							{
								label: `${page.data.t('search.goToResource')}`,
								href: resourceId || ''
							}
						],
						placeAsSibling: true
					}}
				>
					<MoreIcon />
				</span>
			{/key}
		</button>
	{:else}
		<a href={page.data.localizeHref(resourceId)} id={getCellId(0)}>
			{@render resourceSnippet(item)}
		</a>
	{/if}
</div>

<style lang="postcss">
	@reference "tailwindcss";

	.suggestion :global(.contribution-role) {
		display: none;
	}

	.suggestion:has(:global(*:hover)) h2,
	:global(.focused) > .suggestion h2 {
	}

	:global(:not(.focused)) > .suggestion:has(:global(*:hover)) {
		background-color: var(--color-primary-50);
	}

	.suggestion button,
	.suggestion a {
		display: flex;
		align-items: center;
		text-decoration: none;
	}

	.suggestion button:first-child,
	.suggestion a:first-child {
		flex: 1;
		padding: 0 calc(var(--spacing) * 4);
		text-align: left;
	}

	.qualifier.suggestion button:first-child,
	.qualifier.suggestion a:first-child {
		padding-right: 0;
	}

	.suggestion button:not(:first-child):last-child,
	.suggestion a:not(:first-child):last-child {
		text-align: right;
	}

	.resource-heading {
		grid-template-columns: auto auto;

		& :global(.transliteration) {
			display: none;
		}

		& :global(.agent-lifespan) {
			color: var(--color-subtle);
		}
	}

	.resource-footer {
		/* hide dangling divider · */
		& .divider {
			display: none;
		}

		& :global(.divider:has(+ span)) {
			display: inline;
		}
	}

	.more {
		&.focused-cell {
		}
	}

	.more.focused-cell .more-icon-container,
	.more:hover .more-icon-container {
		background-color: var(--color-primary-200);
	}
</style>
