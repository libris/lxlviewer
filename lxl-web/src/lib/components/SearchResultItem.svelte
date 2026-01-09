<script lang="ts">
	import { page } from '$app/state';
	import type { SearchResultItem } from '$lib/types/search';
	import { relativizeUrl } from '$lib/utils/http';
	import DecoratedData from './DecoratedData.svelte';
	import placeholderImage from '$lib/assets/img/placeholder.svg';
	import getInstanceData from '$lib/utils/getInstanceData';
	import TypeIcon from './TypeIcon.svelte';
	import { bookAspectRatio } from '$lib/utils/getTypeLike';

	type Props = { data: SearchResultItem; headerClass?: string };

	let { data, headerClass }: Props = $props();
</script>

{#snippet image()}
	<div class="flex aspect-square w-full max-w-48 items-end justify-center">
		{#if data.image}
			<img
				src={data.image.url}
				width={data.image.widthPx > 0 ? data.image?.widthPx : undefined}
				height={data.image.heightPx > 0 ? data.image?.heightPx : undefined}
				alt={page.data.t('general.latestInstanceCover')}
				class={[
					'aspect-square w-full object-bottom',
					data['@type'] === 'Person' ? 'rounded-full object-cover' : 'object-contain'
				]}
			/>
		{:else}
			<div class="relative flex items-center justify-center">
				<img
					src={placeholderImage}
					alt=""
					class={[
						'object-cover',
						data?.['@type'] === 'Person' ? 'rounded-full' : 'rounded-lg',
						bookAspectRatio(data?.typeForIcon) && 'aspect-3/4'
					]}
				/>
				<TypeIcon type={data.typeForIcon} class="absolute text-4xl text-neutral-300" />
			</div>
		{/if}
	</div>
{/snippet}

<article>
	<header>
		<a
			href={page.data.localizeHref(relativizeUrl(data['@id']))}
			class="flex flex-col items-center outline-0 hover:[&_h2]:underline focus:[&_h2]:underline"
		>
			{@render image()}
			<p class="decorated-card-header-top">
				<TypeIcon type={data.typeForIcon} class="text-3xs mb-0.25 inline" />
				{#if data.typeStr}
					<span class="font-medium">
						{data.typeStr}
					</span>
					<span class="hidden has-[+*]:inline"> · </span>
				{/if}
				{#each data['web-card-header-top']?._display as displayObj, index (index)}
					<span>
						<DecoratedData data={displayObj} showLabels="never" />
					</span>
				{/each}
			</p>
			<hgroup>
				<h2 class={['decorated-card-heading font-medium', headerClass]}>
					<DecoratedData data={data['card-heading']} showLabels="never" />
				</h2>
			</hgroup>
			{#if data['web-card-header-extra']?._display}
				<p class="decorated-card-header-extra">
					{#each data['web-card-header-extra']?._display as displayObj, index (index)}
						<span>
							<DecoratedData data={displayObj} showLabels="defaultOn" />
						</span>
					{/each}
				</p>
			{/if}
		</a>
	</header>
	{#if data['card-body']?._display}
		<div class="decorated-card-body">
			{#each data['card-body']?._display as obj, index (index)}
				<div>
					<DecoratedData data={obj} showLabels="never" block limit={{ contribution: 3 }} />
				</div>
			{/each}
		</div>
	{/if}
	<footer class="decorated-card-footer">
		{#each data['web-card-footer']?._display as obj, index (index)}
			{#if 'hasInstance' in obj}
				{@const instances = getInstanceData(obj.hasInstance)}
				{#if instances?.years}
					{#if instances.count > 1}
						{instances?.count}
						{page.data.t('search.editions')}
						{`(${instances.years})`}
					{:else}
						{instances.years}
					{/if}
				{/if}
				{#if instances?.count === 1}
					{#each obj.hasInstance._display as obj2, index (index)}
						<!-- FIXME we need publication for year, but don't want to show it again with the year -->
						{#if !obj2.publication}
							<DecoratedData data={obj2} showLabels="never" />
						{/if}
					{/each}
				{/if}
			{:else}
				<span>
					<DecoratedData data={obj} showLabels="never" />
				</span>
			{/if}
		{/each}
	</footer>
</article>

<style lang="postcss">
	.decorated-card-header-top,
	.decorated-card-header-extra,
	.decorated-card-footer {
		font-size: var(--text-2xs);
		color: var(--color-subtle);
		font-weight: var(--font-weight-normal);
	}

	.decorated-card-header-extra {
		& :global(span[data-property='hasTitle']:has(> span[data-type='KeyTitle'])) {
			display: none;
		}

		/*
        & :global(span[data-type='KeyTitle'] > span[data-property='rdf:type']) {
            display: none;
        }
         */
	}
</style>
