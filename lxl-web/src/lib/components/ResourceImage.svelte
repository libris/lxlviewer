<script lang="ts">
	import { resolve } from '$app/paths';
	import { fromAction, type Attachment } from 'svelte/attachments';
	import { type Image, type ImageResolution, Width } from '$lib/types/auxd';
	import placeholder from '$lib/assets/img/placeholder.svg';
	import { bestSize } from '$lib/utils/auxd';
	import { page } from '$app/state';
	import { popover } from '$lib/actions/popover';
	import TypeIcon from './TypeIcon.svelte';
	import { bookAspectRatio } from '$lib/utils/bookAspectRatio';

	interface Props {
		image: Image;
		alt?: string;
		linkToFull?: boolean;
		type?: string[];
		thumbnailTargetWidth?: number;
		showPlaceholder?: boolean;
		loading?: 'eager' | 'lazy';
	}

	let {
		image,
		alt,
		linkToFull = false,
		type = [],
		thumbnailTargetWidth = Width.SMALL,
		showPlaceholder = true,
		loading = 'eager'
	}: Props = $props();

	let thumb = $derived(image ? bestSize(image, thumbnailTargetWidth) : undefined);
	let full = $derived(image ? bestSize(image, Width.FULL) : undefined);
	let geometry = $derived(type.includes('Person') ? 'circle' : 'rectangle');

	function imagePopover(title: string): Attachment<HTMLElement> {
		return fromAction(popover, () => ({
			title
		}));
	}
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
			<a
				href={full.url}
				target="_blank"
				class="hidden @3xl:block"
				aria-label={page.data.t('resource.imageLink')}
			>
				{@render img(thumb)}
			</a>
		{/if}
		{@render img(thumb, linkToFull ? '@3xl:hidden' : undefined)}
		<ul class="image-license text-center">
			{#if image.attribution}
				<li class="inline">
					<small class="text-3xs text-subtle">
						{'© '}
						{#if image.attribution.link}
							<a href={image.attribution.link} target="_blank" class="ext-link">
								{image.attribution.name}
							</a>
						{:else}
							{image.attribution.name}
						{/if}
					</small>
				</li>
			{/if}
			<li class="truncate print:hidden inline">
				<small class="text-3xs text-subtle">
					{'ⓘ '}
					{#if image?.usageAndAccessPolicy?.link}
						<a
							href={image.usageAndAccessPolicy.link}
							target="_blank"
							class="ext-link"
							{@attach image?.usageAndAccessPolicy?.title
								? imagePopover(image?.usageAndAccessPolicy?.title)
								: undefined}
						>
							{#if image.usageAndAccessPolicy.identifier}
								{image.usageAndAccessPolicy.identifier}
							{:else}
								{page.data.t('general.usagePolicy')}
							{/if}
						</a>
					{:else if image?.usageAndAccessPolicy?.identifier === 'Nielsen'}
						<a class="link" href={resolve(page.data.localizeHref('/about#nielsen'))}>
							{page.data.t('general.usagePolicyNielsen')}
						</a>
					{:else}
						<a
							class="link"
							href={resolve(page.data.localizeHref('/about#copyright'))}
							{@attach image?.usageAndAccessPolicy?.title
								? imagePopover(image?.usageAndAccessPolicy?.title)
								: undefined}
						>
							{page.data.t('general.usagePolicyLibris')}
						</a>
					{/if}
				</small>
			</li>
		</ul>
	</figure>
{:else if showPlaceholder}
	<div class="mb-6 flex items-center justify-center print:hidden">
		<img
			src={placeholder}
			alt=""
			class={[
				'size-full max-w-40 object-cover @3xl:max-w-48',
				geometry === 'circle' ? 'rounded-full' : 'rounded-lg',
				bookAspectRatio(type) && 'aspect-3/4'
			]}
		/>
		{#if !image}
			<TypeIcon {type} class="absolute text-4xl text-neutral-300 @3xl:text-6xl" />
		{/if}
	</div>
{/if}

<style>
	ul.image-license li:not(:last-child) small::after {
		content: ', ';
	}
</style>
