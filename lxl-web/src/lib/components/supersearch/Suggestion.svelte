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
	<div class="action-type">
		{#if item.qualifiers.length}
			{$page.data.t('search.add')}
			{#if item.qualifiers.length === 1}
				<span class="qualifier-key">
					{item.qualifiers[0].label}
				</span>
			{:else}
				<span class="badge">
					{item.qualifiers.length}
				</span>
			{/if}
		{:else}
			{$page.data.t('search.goTo')}
		{/if}
	</div>
	<div class="resource">
		<SuggestionImage {item} />
		<div class="resource-content">
			<hgroup class="resource-heading">
				<h2 class="inline overflow-hidden text-ellipsis text-secondary text-3-cond-bold">
					<DecoratedData
						data={item[LxlLens.CardHeading]}
						showLabels={ShowLabelsOptions.Never}
						allowPopovers={false}
						allowLinks={false}
					/>
				</h2>
				{#if item[LxlLens.CardBody]?._display?.[0]}
					<p class="inline overflow-hidden text-ellipsis text-sm text-secondary">
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
			<div class="resource-footer">
				<strong class="text-xs text-secondary">
					{item.typeStr}
				</strong>
				<span class="text-xs">
					{#if item.typeStr.length}
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
							<span class="text-xs">
								<DecoratedData
									data={obj}
									showLabels={ShowLabelsOptions.Never}
									allowLinks={false}
									allowPopovers={false}
								/>
							</span>
						{/if}
					{/each}
				</span>
			</div>
		</div>
	</div>
{/snippet}

<div class="suggestion" class:qualifier={item.qualifiers.length}>
	{#if item.qualifiers.length}
		<button
			type="button"
			id={getCellId(0)}
			class:focused-cell={isFocusedCell(0)}
			onclick={handleClickPrimaryAction}
		>
			{@render resourceSnippet(item)}
		</button>
		<button type="button" class="more" id={getCellId(1)} class:focused-cell={isFocusedCell(1)}>
			<span
				class="more-icon-container"
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
		</button>
	{:else}
		<a href={resourceId}>
			{@render resourceSnippet(item)}
		</a>
	{/if}
</div>

<style lang="postcss">
	.suggestion {
		display: flex;
		align-items: stretch;
		height: 56px;

		& :global([data-property='role']),
		& :global(._contentBefore:has(+ [data-property='role'])),
		& :global([data-property='role'] + ._contentAfter) {
			display: none;
		}
	}

	.suggestion:has(:global(*:hover)) h2,
	:global(.focused) > .suggestion h2 {
		color: theme(textColor.primary);
	}

	:global(:not(.focused)) > .suggestion:has(:global(*:hover)) {
		background: theme(backgroundColor.main);
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
		padding: 0 theme(padding.4);
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

	.action-type {
		font-size: theme(fontSize.sm);
		margin-left: auto;
		padding-left: theme(padding.2);
		color: theme(textColor.tertiary);
		order: 1;
		white-space: nowrap;
	}

	.badge {
		background: theme(backgroundColor.positive);
		border-radius: theme(borderRadius.full);
		padding: theme(padding[0.5]) theme(padding.2);
		font-size: theme(fontSize.xs);
		margin-left: theme(margin.1);
	}

	.qualifier-key {
		display: none;

		@media screen and (min-width: theme('screens.lg')) {
			display: inline;
			text-transform: lowercase;
		}
	}

	.resource {
		display: grid;
		grid-template-columns: 40px minmax(0, 1fr);
		align-items: center;
		gap: theme(gap.2);
	}

	.resource-heading {
		white-space: nowrap;
		overflow: hidden;
		line-height: 1;
	}

	.resource-footer {
		line-height: 1;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;

		/* hide dangling divider • */
		& .divider {
			@apply hidden;
		}

		& :global(.divider:has(+ span)) {
			@apply inline;
		}
	}

	.resource-heading > * {
		display: inline-block;
	}

	.resource-heading h2 {
		display: inline-block;
		max-width: 50vw;
		text-overflow: ellipsis;

		@media screen and (min-width: theme('screens.md')) {
			max-width: 33vw;
		}
	}

	.more {
		display: flex;
		align-items: center;
		justify-content: center;
		color: theme(textColor.secondary);
		width: 56px;
		padding: 0;

		&.focused-cell {
			color: theme(textColor.primary);
		}
	}

	.more-icon-container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: theme(borderRadius.full);
	}

	.more.focused-cell .more-icon-container,
	.more:hover .more-icon-container {
		background: theme(backgroundColor.positive);
		color: theme(textColor.positive);
	}
</style>
