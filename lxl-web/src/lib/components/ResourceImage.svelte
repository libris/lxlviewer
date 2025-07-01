<script lang="ts">
	import { type Image, type ImageResolution, Width } from '$lib/types/auxd';
	import placeholder from '$lib/assets/img/placeholder.svg';
	import getTypeIcon from '$lib/utils/getTypeIcon';
	import { bestSize } from '$lib/utils/auxd';
	import { first } from '$lib/utils/xl';
	import { page } from '$app/state';
	import { popover } from '$lib/actions/popover';
	import InfoIcon from '~icons/bi/info-circle';

	interface Props {
		images: Image[];
		alt: string | undefined;
		linkToFull?: boolean;
		type?: string;
		thumbnailTargetWidth?: number;
		showPlaceholder?: boolean;
		geometry?: 'rectangle' | 'circle';
		loading?: 'eager' | 'lazy';
	}

	let {
		images,
		alt,
		linkToFull = false,
		type = '',
		thumbnailTargetWidth = Width.SMALL,
		showPlaceholder = true,
		geometry = 'rectangle',
		loading = 'eager'
	}: Props = $props();

	let image = $derived(first(images));
	let thumb = $derived(image ? bestSize(image, thumbnailTargetWidth) : undefined);
	let full = $derived(image ? bestSize(image, Width.FULL) : undefined);
</script>

{#snippet img(res: ImageResolution, imgClass?: string | string[])}
	<img
		{alt}
		{loading}
		src={res.url}
		width={res.widthPx > 0 ? res.widthPx : undefined}
		height={res.heightPx > 0 ? res.heightPx : undefined}
		class={[
			'mt-1.5 aspect-square object-contain',
			geometry === 'circle' && 'max-w-48 rounded-full',
			imgClass
		]}
	/>
{/snippet}

{#if image && thumb}
	<figure class="flex w-full flex-col items-center gap-3">
		{#if linkToFull && full}
			<a href={full.url} target="_blank" class="hidden @3xl:block">
				{@render img(thumb)}
			</a>
		{/if}
		{@render img(thumb, linkToFull ? '@3xl:hidden' : undefined)}
		<figcaption class="text-5xs text-subtle w-full">
			{#if image.attribution}
				<span class="mr-1">
					{'© '}
					{#if image.attribution.link}
						<a href={image.attribution.link} target="_blank" class="ext-link">
							{image.attribution.name}
						</a>
					{:else}
						{image.attribution.name}
					{/if}
				</span>
			{/if}
			<span class="truncate" use:popover={{ title: image?.usageAndAccessPolicy.title }}>
				<InfoIcon class="inline" />
				{#if image.usageAndAccessPolicy.link}
					<a href={image.usageAndAccessPolicy.link} target="_blank" class="ext-link">
						{#if image.usageAndAccessPolicy.identifier}
							{image.usageAndAccessPolicy.identifier}
						{:else}
							{page.data.t('general.usagePolicy')}
						{/if}
					</a>
				{:else}
					{page.data.t('general.usagePolicy')}
				{/if}
			</span>
		</figcaption>
	</figure>
{:else if showPlaceholder}
	<div class="flex items-center justify-center">
		<img
			src={placeholder}
			alt=""
			class={[
				'size-full max-w-48 object-cover',
				geometry === 'circle' ? 'rounded-full' : 'rounded-sm'
			]}
		/>
		{#if getTypeIcon(type)}
			{@const SvelteComponent = getTypeIcon(type)}
			<SvelteComponent class="text-subtle absolute text-2xl" />
		{/if}
	</div>
{/if}
