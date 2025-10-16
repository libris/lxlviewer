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
		alt?: string;
		linkToFull?: boolean;
		type?: string;
		thumbnailTargetWidth?: number;
		showPlaceholder?: boolean;
		loading?: 'eager' | 'lazy';
	}

	let {
		images,
		alt,
		linkToFull = false,
		type = '',
		thumbnailTargetWidth = Width.SMALL,
		showPlaceholder = true,
		loading = 'eager'
	}: Props = $props();

	let image = $derived(first(images));
	let thumb = $derived(image ? bestSize(image, thumbnailTargetWidth) : undefined);
	let full = $derived(image ? bestSize(image, Width.FULL) : undefined);
	let geometry = $derived(type === 'Person' ? 'circle' : 'rectangle');
	let TypeIcon = $derived(!image ? getTypeIcon(type) : undefined);
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
			geometry === 'circle' && 'max-w-40 rounded-full object-cover @3xl:max-w-48',
			imgClass
		]}
	/>
{/snippet}

{#if image && thumb}
	<figure class="flex w-full flex-col items-center gap-2">
		{#if linkToFull && full}
			<a href={full.url} target="_blank" class="hidden @3xl:block">
				{@render img(thumb)}
			</a>
		{/if}
		{@render img(thumb, linkToFull ? '@3xl:hidden' : undefined)}
		<figcaption class="text-5xs @3xl:text-4xs text-subtle">
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
	<div class="mb-6 flex items-center justify-center">
		<img
			src={placeholder}
			alt=""
			class={[
				'size-full max-w-40 object-cover @3xl:max-w-48',
				geometry === 'circle' ? 'rounded-full' : 'rounded-lg',
				(type === 'Text' || type === 'Literature') && 'aspect-3/4'
			]}
		/>
		{#if TypeIcon}
			<TypeIcon class="absolute text-4xl text-neutral-300 @3xl:text-6xl" />
		{/if}
	</div>
{/if}
