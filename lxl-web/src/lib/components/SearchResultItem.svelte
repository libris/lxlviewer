<script lang="ts">
	import { page } from '$app/state';
	import type { SearchResultItem } from '$lib/types/search';
	import { relativizeUrl } from '$lib/utils/http';
	import DecoratedData from './DecoratedData.svelte';
	import placeholderImage from '$lib/assets/img/placeholder.svg';
	import getInstanceData from '$lib/utils/getInstanceData';
	import TypeIcon from './TypeIcon.svelte';
	import { bookAspectRatio } from '$lib/utils/getTypeLike';

	type Props = { data: SearchResultItem };

	let { data }: Props = $props();
</script>

{#snippet image()}
	<div
		class="resource-image mx-auto mb-2 flex aspect-square w-full items-end justify-center rounded-lg bg-neutral-100 p-3"
	>
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

<article class="@container min-w-36">
	<header>
		<a
			href={page.data.localizeHref(relativizeUrl(data['@id']))}
			class="resource-link flex flex-col items-stretch -outline-offset-2 hover:[&_h2]:underline"
		>
			{@render image()}
			<p class="text-subtle mb-0.5 text-xs">
				<TypeIcon type={data.typeForIcon} class="text-3xs @4xs:text-2xs inline" />
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
				<h2 class={['@4xs:text-[0.9375rem]! line-clamp-2 text-sm font-medium hover:underline']}>
					<DecoratedData data={data['card-heading']} showLabels="never" />
				</h2>
				{#if data['web-card-header-extra']?._display}
					<p class="text-subtle line-clamp-2 text-xs">
						{#each data['web-card-header-extra']?._display as displayObj, index (index)}
							<span>
								<DecoratedData data={displayObj} showLabels="defaultOn" />
							</span>
						{/each}
					</p>
				{/if}
			</hgroup>
		</a>
	</header>
	{#if data['card-body']?._display}
		<div class="4xs:text-sm decorated-card-body mt-1 mb-1.5 text-xs">
			{#each data['card-body']?._display as obj, index (index)}
				<div class="@4xs:text-sm flex flex-col items-center text-center">
					<DecoratedData data={obj} showLabels="never" block limit={{ contribution: 3 }} />
				</div>
			{/each}
		</div>
	{/if}
	<footer class="@4xs:text-[0.8125rem] text-xs">
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
	.decorated-card-body {
		& :global([data-property='contribution']) {
			display: flex;
			flex-direction: column;
			align-items: center;

			&::global(> *) {
				@apply truncate;
			}
		}
	}
</style>
