<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { relativizeUrl } from '$lib/utils/http';
	import type { QualifierSuggestion, SuperSearchResultItem } from '$lib/types/search';
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
		addQualifier: (qualifier: QualifierSuggestion) => void;
	};

	const { item, getCellId, isFocusedCell, addQualifier }: Props = $props();
	const resourceId = $derived(relativizeUrl(item?.['@id']));

	function handleClickPrimaryAction() {
		if (item?.qualifiers.length) {
			addQualifier(item?.qualifiers[0]);
		} else if (resourceId) {
			goto(resourceId);
		}
	}
</script>

{#snippet resourceSnippet(item: SuperSearchResultItem)}
	{#if item.qualifiers.length}
		<span
			class="text-subtle order-1 ml-auto hidden rounded-sm px-1.5 py-0.5 text-xs whitespace-nowrap sm:inline"
		>
			{$page.data.t('search.add')}

			<span class="hidden lowercase md:inline">
				{item.qualifiers[0].label}
			</span>
		</span>
	{:else}
		<div class="sr-only">{$page.data.t('search.goTo')}</div>
	{/if}
	<div class="resource grid grid-cols-[40px_minmax(0,_1fr)] items-center gap-2">
		<SuggestionImage {item} />
		<div class="resource-content">
			<hgroup class="resource-heading flex overflow-hidden text-xs font-medium whitespace-nowrap">
				<h2 class="inline-block max-w-[40vw] overflow-hidden text-ellipsis sm:max-w-[33vw]">
					<DecoratedData
						data={item[LxlLens.CardHeading]}
						showLabels={ShowLabelsOptions.Never}
						allowPopovers={false}
						allowLinks={false}
					/>
				</h2>
				{#if item[LxlLens.CardBody]?._display?.[0]}
					<p class="inline-block overflow-hidden text-ellipsis">
						<span class="divider">{' • '}</span>
						<DecoratedData
							data={item[LxlLens.CardBody]?._display[0]}
							showLabels={ShowLabelsOptions.Never}
							allowLinks={false}
							allowPopovers={false}
						/>
					</p>
				{/if}
			</hgroup>
			<div
				class="resource-footer text-3xs text-subtle overflow-hidden text-ellipsis whitespace-nowrap"
			>
				<strong class="font-medium">
					{item.typeStr}
				</strong>
				{#if item.typeStr?.length}
					<span class="divider">{' • '}</span>
				{/if}
				{#each item?.[LensType.WebCardFooter]?._display as obj}
					{#if 'hasInstance' in obj}
						{@const instances = getInstanceData(obj.hasInstance)}
						{#if instances?.years}
							<span class="divider">{' • '}</span>
							<span>
								{#if instances.count > 1}
									{instances?.count}
									{$page.data.t('search.editions')}
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
		<button
			type="button"
			id={getCellId(0)}
			class:focused-cell={isFocusedCell(0)}
			onclick={handleClickPrimaryAction}
		>
			{@render resourceSnippet(item)}
		</button>
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
								label: `${$page.data.t('search.addAs')} ${qualifier.label.toLocaleLowerCase()}`,
								action: () => addQualifier(qualifier)
							})),
							{
								label: `${$page.data.t('search.goToResource')}`,
								action: () => goto(resourceId as string)
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
		<a href={resourceId}>
			{@render resourceSnippet(item)}
		</a>
	{/if}
</div>

<style lang="postcss">
	@reference "tailwindcss";

	.suggestion {
		& :global([data-property='role']),
		& :global(._contentBefore:has(+ [data-property='role'])),
		& :global([data-property='role'] + ._contentAfter) {
			display: none;
		}
	}

	.suggestion:has(:global(*:hover)) h2,
	:global(.focused) > .suggestion h2 {
	}

	:global(:not(.focused)) > .suggestion:has(:global(*:hover)) {
		background-color: --alpha(var(--color-primary) / 10%);
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
		& :global(span[data-property='_script']) {
			display: none;
		}

		& :global(span[data-property='lifeSpan']) {
			color: var(--color-subtle);
		}
	}

	.resource-footer {
		/* hide dangling divider • */
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
		background-color: --alpha(var(--color-primary) / 20%);
	}
</style>
