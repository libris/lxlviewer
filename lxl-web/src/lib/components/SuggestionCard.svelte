<script lang="ts">
	import jmespath from 'jmespath';
	import type { SearchResultItem } from '$lib/types/search';
	import type { ResourceData } from '$lib/types/resourceData';
	import { LensType } from '$lib/types/xl';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import { LxlLens } from '$lib/types/display';
	import { relativizeUrl } from '$lib/utils/http';
	import getTypeIcon from '$lib/utils/getTypeIcon';
	import placeholder from '$lib/assets/img/placeholder.svg';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { page } from '$app/stores';
	import SearchItemDebug from '$lib/components/find/SearchItemDebug.svelte';
	import EsExplain from '$lib/components/find/EsExplain.svelte';

	type Props = {
		item: SearchResultItem;
		cellId: string;
		isFocused: boolean;
	};

	const { item, cellId, isFocused }: Props = $props();

	const itemId = $derived(relativizeUrl(item['@id']));
	const titleId = $derived(`card-title-${itemId}`);
	const footerId = $derived(`card-footer-${itemId}`);

	let showDebugExplain = $state(false);

	function getInstanceData(instances: ResourceData) {
		if (typeof instances === 'object') {
			let years: string = '';
			let count = 1;
			let query = '_display[].publication[].*[][?year].year[]';

			if (Array.isArray(instances)) {
				count = instances.length;
				query = '[]._display[].publication[].*[][?year].year[]';
			}

			let res = jmespath.search(instances, query) as string[] | null;
			if (res) {
				years = res
					.filter((el, i, arr) => !isNaN(parseInt(el)) && arr.indexOf(el) === i)
					.sort()
					.filter((el, i, arr) => i === 0 || i === arr.length - 1)
					.join('-');
			}

			return { count, years };
		}
		return null;
	}
</script>

<div class="suggestion-card-container">
	<article class="suggestion-card">
		<a
			id={cellId}
			role="gridcell"
			class={['card-link', isFocused && 'bg-site-header/40']}
			href={itemId}
			aria-labelledby={titleId}
			aria-describedby={`${footerId}`}
		></a>
		<div class="card-image">
			<div class="pointer-events-none relative flex">
				{#if item.image}
					<img
						src={item.image.url}
						width={item.image.widthṔx}
						height={item.image.heightPx}
						alt={$page.data.t('general.latestInstanceCover')}
						class:rounded-full={item['@type'] === 'Person'}
						class="aspect-square object-contain object-top"
					/>
					{#if item['@type'] !== 'Text' && item['@type'] !== 'Person' && getTypeIcon(item['@type'])}
						{@const SvelteComponent = getTypeIcon(item['@type'])}
						<div class="absolute -left-2 -top-2">
							<div class="rounded-md bg-cards p-1.5">
								<SvelteComponent class="h-3 w-3 text-icon-strong" />
							</div>
						</div>
					{/if}
				{:else}
					<div class="flex items-center justify-center">
						<img
							src={placeholder}
							alt=""
							class:rounded-full={item['@type'] === 'Person'}
							class:rounded-sm={item['@type'] !== 'Person'}
							class="object-contain object-top"
						/>
						{#if getTypeIcon(item['@type'])}
							{@const SvelteComponent_1 = getTypeIcon(item['@type'])}
							<SvelteComponent_1 class="absolute text-lg text-icon" />
						{/if}
					</div>
				{/if}
			</div>
		</div>
		<div class="card-content pointer-events-none z-10 overflow-hidden">
			<header class="card-header" id={titleId}>
				<hgroup class="flex">
					<h2 class="card-header-title">
						<span class="header-title">
							<DecoratedData data={item['card-heading']} showLabels={ShowLabelsOptions.Never} />
						</span>
						<!-- first contributor -->
						{#if item[LxlLens.CardBody]?._display?.[0]?.contribution}
							<span class="divider">&nbsp;{'•'}&nbsp;</span>
							<span class="header-contributor">
								<DecoratedData
									data={item[LxlLens.CardBody]?._display[0]}
									showLabels={ShowLabelsOptions.Never}
									allowLinks={false}
									truncate={true}
								/>
							</span>
						{/if}
					</h2>
				</hgroup>
				<!-- header extra skipped -->
			</header>
			<footer class="card-footer" id={footerId}>
				<span class="font-bold">
					{item.typeStr}
				</span>
				<span class="divider">{' • '}</span>
				{#each item[LensType.WebCardFooter]?._display as obj}
					{#if 'hasInstance' in obj}
						<span class="divider">{' • '}</span>
						{@const instances = getInstanceData(obj.hasInstance)}
						{#if instances?.years}
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
						<span>
							<DecoratedData data={obj} showLabels={ShowLabelsOptions.Never} allowLinks={false} />
						</span>
					{/if}
				{/each}
			</footer>
		</div>
		{#if item._debug}
			{#key item._debug}
				<button
					type="button"
					class="card-debug z-20 cursor-crosshair select-text self-start text-left"
					onclick={() => {
						showDebugExplain = !showDebugExplain;
					}}
				>
					<SearchItemDebug debugInfo={item._debug} />
				</button>
				{#if showDebugExplain}
					<div id="explain" class="z-20 col-span-full row-start-2 cursor-crosshair pt-4">
						<EsExplain explain={item._debug.score.explain} />
					</div>
				{/if}
			{/key}
		{/if}
	</article>
</div>

<style lang="postcss">
	.suggestion-card-container {
		container-type: inline-size;
	}

	.suggestion-card {
		@apply relative grid w-full gap-x-4 border-b border-b-primary/16 px-4 pb-3 pt-3 font-normal;

		grid-template-areas: 'image content debug';
		grid-template-columns: 48px 1fr auto;
	}

	.card-link {
		@apply absolute h-full w-full hover:bg-main;
	}

	.card-image {
		grid-area: image;
	}

	.card-content {
		grid-area: content;
	}

	.card-debug {
		grid-area: debug;
	}

	.card-header-title {
		@apply flex overflow-hidden whitespace-nowrap font-bold text-link text-3-cond;

		& .header-title {
			@apply overflow-hidden text-ellipsis;
		}

		/* hide contributor remainder */
		& .header-contributor {
			@apply flex-shrink-0 font-normal;
			& :global(.remainder) {
				@apply hidden;
			}
		}

		/* hide role */
		& :global([data-property='role']),
		:global(._contentBefore:has(+ [data-property='role'])),
		:global([data-property='role'] + ._contentAfter) {
			@apply hidden;
		}
	}

	.card-footer {
		@apply mt-auto pt-1;
		/* only show • with something after */
		& .divider {
			@apply hidden;
		}
		& :global(.divider:has(+ span)) {
			@apply inline;
		}
	}

	.card-footer,
	.card-header :global([data-property='_script']) {
		@apply text-xs text-secondary;
		@container (min-width: 768px) {
			@apply text-sm;
		}
	}

	/** TODO: Set transliteration styling via display-web.json? */
	:global(.card-header [data-property='_script']) {
		@apply block;
	}
</style>
