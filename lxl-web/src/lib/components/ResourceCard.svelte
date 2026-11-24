<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import placeholder from '#lib/assets/img/placeholder.svg';
	import type { SearchResultItem } from '#lib/types/search.ts';
	import { Fmt, JsonLd, LensType } from '#lib/types/xl.ts';
	import { LxlLens } from '#lib/types/display.ts';
	import { Elem, HeadingElem, ShowLabelsOptions } from '#lib/types/decoratedData.ts';
	import { normalizeId } from '#lib/utils/http.ts';
	import { bookAspectRatio } from '#lib/utils/bookAspectRatio.ts';
	import { isResourceNode } from '#lib/utils/resourceData.ts';
	import getInstanceData from '#lib/utils/getInstanceData.ts';
	import { asAdjacentSearchResult } from '#lib/utils/adjacentSearchResult.ts';
	import ResourceCardSelect from '#lib/components/ResourceCardSelect.svelte';
	import TypeIcon from '#lib/components/TypeIcon.svelte';
	import DecoratedData2 from '#lib/components/DecoratedData2.svelte';
	import ResourceCardActions from '#lib/components/ResourceCardActions.svelte';
	import SearchItemDebug from '#lib/components/find/SearchItemDebug.svelte';

	type Props = {
		item: SearchResultItem;
		itemNo?: number;
		variant?: 'default' | 'compact' | 'gallery';
		selectable?: boolean;
		allowImage?: boolean;
		linkToResource?: boolean;
		hideType?: boolean;
		allowLinks?: boolean;
		allowActions?: boolean;
		allowPopovers?: boolean;
		headingElement?: HeadingElem;
	};

	let {
		item,
		itemNo = undefined,
		variant = 'default',
		selectable = false,
		allowImage = true,
		linkToResource = true,
		hideType = false,
		allowLinks = true,
		allowActions = true,
		allowPopovers = true,
		headingElement = HeadingElem.H2
	}: Props = $props();

	let id = $derived(normalizeId(item[JsonLd.ID]) ?? '');
	let cardId = $derived(`resource-card-${id}`);
	let titleId = $derived(`card-title-${id}`);
	let bodyId = $derived(`card-body-${id}`);
	let footerId = $derived(`card-footer-${id}`);

	const resourceLink = $derived.by(() => {
		if (!linkToResource) return undefined;
		const url = new URL(page.url.origin + page.data.localizeHref(id));
		const _q = page.url.searchParams.get('_q')?.trim();
		if (_q && _q !== '*') {
			url.searchParams.append('_q', _q);
			return url.toString();
		}
		return url.toString();
	});

	const webCardHeaderTop = $derived(
		isResourceNode(item[LensType.WebCardHeaderTop]) &&
			item[LensType.WebCardHeaderTop]?.[Fmt.DISPLAY].length > 0
			? item[LensType.WebCardHeaderTop]
			: undefined
	);
	const webCardHeaderExtra = $derived(
		isResourceNode(item[LensType.WebCardHeaderExtra]) &&
			item[LensType.WebCardHeaderExtra]?.[Fmt.DISPLAY].length > 0
			? item[LensType.WebCardHeaderExtra]
			: undefined
	);
	const cardBody = $derived(
		isResourceNode(item[LxlLens.CardBody]) && item[LxlLens.CardBody][Fmt.DISPLAY]?.length
			? item[LxlLens.CardBody]
			: undefined
	);
	const cardFooter = $derived(
		isResourceNode(item[LensType.WebCardFooter]) &&
			item[LensType.WebCardFooter][Fmt.DISPLAY]?.length
			? item[LensType.WebCardFooter]
			: undefined
	);

	function passAlongAdjacentSearchResults(event: MouseEvent) {
		event.preventDefault();
		goto((event.currentTarget as HTMLAnchorElement).href, {
			state: {
				...page.state,
				adjacentSearchResults: page.data.searchResult
					? [asAdjacentSearchResult(page.data.searchResult)]
					: []
			}
		});
	}
</script>

{#snippet image()}
	{const isPerson = item[JsonLd.TYPE] === 'Person'}
	<div class="pointer-events-none relative flex">
		{#if item.image}
			<img
				src={item.image.url}
				width={item.image.widthPx > 0 ? item.image.widthPx : undefined}
				height={item.image.heightPx > 0 ? item.image.heightPx : undefined}
				alt=""
				class:rounded-full={isPerson}
				class="object-contain object-top {!isPerson ? 'aspect-2/3' : 'aspect-square'}"
			/>
		{:else}
			<div class="flex items-center justify-center">
				<img
					src={placeholder}
					alt=""
					class:rounded-full={isPerson}
					class:rounded-sm={!isPerson}
					class={[
						'placeholder object-cover object-top',
						bookAspectRatio(item.typeForIcon) && 'aspect-3/4'
					]}
				/>
				<TypeIcon type={item.typeForIcon} class="absolute text-2xl text-neutral-400" />
			</div>
		{/if}
	</div>
{/snippet}

{#snippet heading()}
	<DecoratedData2
		data={item[LxlLens.CardHeading]}
		showLabels={ShowLabelsOptions.Never}
		allowLinks={resourceLink ? allowLinks : false}
		{allowPopovers}
		parent={resourceLink ? Elem.A : Elem.Span}
		skipOuter={true}
	/>
{/snippet}

<div class="resource-card-container @container/card">
	<article
		id={cardId}
		class="resource-card grid w-full gap-x-4 p-3 transition-colors print:break-inside-avoid"
		class:default={variant === 'default'}
		class:compact={variant === 'compact'}
		class:gallery={variant === 'gallery'}
		class:selectable
	>
		{#if selectable && variant !== 'gallery'}
			<ResourceCardSelect {id} {itemNo} {titleId} />
		{/if}
		{#if allowImage}
			<!-- image -->
			{#if resourceLink}
				<a
					class="card-image"
					href={resourceLink}
					aria-labelledby={titleId}
					aria-describedby={`${bodyId} ${footerId}`}
					tabindex="-1"
					onclick={passAlongAdjacentSearchResults}
				>
					{@render image()}
				</a>
			{:else}
				<div class="card-image">{@render image()}</div>
			{/if}
		{/if}
		<div class="card-content flex flex-col">
			<header id={titleId}>
				<!-- header-top -->
				{#if item.typeStr && !hideType}
					<p class="card-header-top">
						<TypeIcon
							type={item.typeForIcon}
							class="text-2xs mr-px mb-px inline align-text-bottom"
						/>
						<span class="font-medium">
							{item.typeStr}
						</span>
						{#if webCardHeaderTop}
							<span class="divider">{' · '}</span>
							<DecoratedData2
								data={webCardHeaderTop}
								showLabels={ShowLabelsOptions.Never}
								allowLinks={linkToResource ? allowLinks : false}
								{allowPopovers}
								parent={Elem.Span}
								skipOuter={true}
							/>
						{/if}
					</p>
				{/if}
				<hgroup>
					<!-- heading -->
					<svelte:element
						this={headingElement}
						class="decorated-heading card-header-title text-base"
					>
						{#if resourceLink}
							<a
								href={resourceLink}
								class="block hover:text-link focus:text-link hover:underline focus:underline"
								aria-describedby={`${bodyId} ${footerId}`}
								onclick={passAlongAdjacentSearchResults}
							>
								{@render heading()}
							</a>
						{:else}
							<span class="block">{@render heading()}</span>
						{/if}
					</svelte:element>
				</hgroup>
				{#if webCardHeaderExtra}
					<!-- header extra -->
					<p class="card-header-extra">
						<DecoratedData2
							data={webCardHeaderExtra}
							showLabels={ShowLabelsOptions.DefaultOn}
							{allowLinks}
							{allowPopovers}
							parent={Elem.P}
							skipOuter={true}
						/>
					</p>
				{/if}
				{#if item['_workTitle2'] && isResourceNode(item['_workTitle2'])}
					<!-- work title 2 -->
					<p class="card-header-extra">
						<DecoratedData2
							data={item['_workTitle2']}
							showLabels={ShowLabelsOptions.DefaultOff}
							{allowLinks}
							{allowPopovers}
							parent={Elem.P}
							skipOuter={true}
						/>
					</p>
				{/if}
			</header>
			{#if cardBody}
				<!-- card-body -->
				<div class="card-body mt-1 text-sm" id={bodyId}>
					<DecoratedData2
						data={cardBody}
						showLabels={ShowLabelsOptions.DefaultOff}
						limit={{
							contribution: 3,
							hasPart: 5,
							related: 5,
							broader: 5,
							narrower: 5,
							identifiedBy: 3
						}}
						allowLinks={true}
						{allowPopovers}
						parent={Elem.Div}
						skipOuter={true}
					/>
				</div>
			{/if}
		</div>
		{#if item.selectTypeStr || cardFooter}
			<!-- card-footer -->
			<footer class="card-footer mt-1" id={footerId}>
				{#if item.selectTypeStr}
					<span class="text-body font-medium">{item.selectTypeStr}</span>
				{/if}
				{#if item.selectTypeStr && cardFooter}
					<span class="hidden whitespace-pre-wrap md:inline">{'·'}</span>
				{/if}
				{#if cardFooter}
					<span>
						{#each cardFooter?.[Fmt.DISPLAY] as obj, index (index)}
							{#if obj[Fmt.PROP] === 'hasInstance'}
								{@const instances = getInstanceData(obj[Fmt.VALUE])}
								{#if instances?.years}
									{#if instances.count > 1}
										{instances?.count}
										{page.data.t('search.editions')}
										{`(${instances.years})`}
									{:else}
										{instances.years}
									{/if}
								{/if}
								{#if instances?.count === 1 && isResourceNode(obj[Fmt.VALUE])}
									{#each obj[Fmt.VALUE]?.[Fmt.DISPLAY] as obj2, index (index)}
										<!-- FIXME we need publication for year, but don't want to show it again with the year -->
										{#if obj2[Fmt.PROP] === 'publication' && !obj2[Fmt.VALUE]}
											<span class="divider">{'·'}</span>
											<DecoratedData2
												data={obj2}
												showLabels={ShowLabelsOptions.Never}
												allowLinks={false}
												{allowPopovers}
												parent={Elem.Span}
												skipOuter={true}
											/>
										{/if}
									{/each}
								{/if}
							{:else}
								<span>
									<DecoratedData2
										data={obj}
										showLabels={ShowLabelsOptions.Never}
										allowLinks={true}
										{allowPopovers}
										parent={Elem.Span}
										limit={{ editionStatement: 1, publication: 1, identifier: 1 }}
									/>
								</span>
							{/if}
						{/each}
					</span>
				{/if}
			</footer>
		{/if}
		{#if allowActions}
			<!-- card actions -->
			<ResourceCardActions {item} {id} />
		{/if}
		{#if item._debug}
			<!-- debug -->
			<SearchItemDebug debugInfo={item._debug} />
		{/if}
	</article>
</div>

<style lang="postcss">
	.resource-card {
		/* default variant */
		&.default {
			grid-template-columns: 64px 1fr auto;
			grid-template-areas:
				'image content content'
				'image footer footer'
				'actions actions actions'
				'debug . .';

			@container card (min-width: 768px) {
				grid-template-columns: 72px 1fr auto;
				column-gap: calc(var(--spacing) * 6);
				padding-inline: calc(var(--spacing) * 6);
				padding-block: calc(var(--spacing) * 4);
			}

			@container card (min-width: 640px) {
				grid-template-areas:
					'image content content'
					'image content content'
					'image footer actions'
					'debug . .';
			}

			/* selectable default */
			&.selectable {
				grid-template-columns: minmax(0px, auto) 64px 1fr auto;
				column-gap: calc(var(--spacing) * 3);
				grid-template-areas:
					'select image content content'
					'select image footer footer'
					'. actions actions actions'
					'. debug . .';

				@container card (min-width: 768px) {
					grid-template-columns: minmax(0px, auto) 72px 1fr auto;
					column-gap: calc(var(--spacing) * 4);
					padding-inline: calc(var(--spacing) * 3);
				}

				@container card (min-width: 640px) {
					grid-template-areas:
						'select image content content'
						'select image content content'
						'. image footer actions'
						'. debug . .';
				}
			}
		}

		/* Gallery variant */
		&.gallery {
			grid-template-areas:
				'image'
				'content'
				'footer'
				'actions'
				'debug';
		}
	}

	.card-image {
		grid-area: image;
	}

	.card-content {
		grid-area: content;

		& :global(.contribution-role) {
			color: var(--color-subtle);
			font-size: var(--text-xs);
		}
	}

	.card-footer {
		grid-area: footer;
	}

	.card-body {
		&:global(:has(a.link)) {
			line-height: calc(var(--spacing) * 6);
		}
	}

	.card-header-top,
	.card-header-extra,
	.card-footer {
		font-size: var(--text-2xs);
		color: var(--color-subtle);
		font-weight: var(--font-weight-normal);
	}

	/* card in popover */
	:global(.popover .resource-card-container) {
		container-type: normal;

		& .resource-card {
			padding: calc(var(--spacing) * 1);
			padding-top: 0;
			column-gap: calc(var(--spacing) * 3);

			&:has(img.placeholder) {
				grid-template-columns: 1fr;
				grid-template-areas:
					'content'
					'footer';

				& .card-image {
					display: none;
				}
			}
		}

		& .card-header-title {
			font-size: var(--text-base);
		}
	}
</style>
