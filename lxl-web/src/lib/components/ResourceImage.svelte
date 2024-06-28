<script lang="ts">
	import { type Image, Width } from '$lib/types/auxd';
	import placeholder from '$lib/assets/img/placeholder.svg';
	import getTypeIcon from '$lib/utils/getTypeIcon';
	import { bestSize } from '$lib/utils/auxd';
	import { first } from '$lib/utils/xl';
	import { page } from '$app/stores';
	import { popover } from '$lib/actions/popover';
	import InfoIcon from '~icons/bi/info-circle';

	export let images: Image[];
	export let alt: string | undefined;
	export let linkToFull = false;
	export let type = '';
	export let thumbnailTargetWidth: number = Width.SMALL;
	export let showPlaceholder = true;
	export let geometry: 'rectangle' | 'circle' = 'rectangle';
	export let loading: 'eager' | 'lazy' = 'eager';

	$: image = first(images);

	$: thumb = (image && bestSize(image, thumbnailTargetWidth)) || undefined;
	$: full = (image && bestSize(image, Width.FULL)) || undefined;
</script>

{#if image && thumb}
	<figure class="table">
		{#if linkToFull && full}
			<a href={full.url} target="_blank" class="object-[inherit]">
				<img
					{alt}
					{loading}
					src={thumb.url}
					width={thumb.widthṔx}
					height={thumb.heightPx}
					class="object-contain object-[inherit]"
					class:object-cover={geometry === 'circle'}
					class:rounded-full={geometry === 'circle'}
				/>
			</a>
		{:else}
			<img
				{alt}
				{loading}
				src={thumb.url}
				width={thumb.widthṔx}
				height={thumb.heightPx}
				class="object-contain object-[inherit]"
				class:rounded-full={geometry === 'circle'}
			/>
		{/if}
		{#if image?.usageAndAccessPolicy}
			<figcaption
				class="mt-2 table-caption caption-bottom overflow-hidden text-[10px]"
				class:text-center={geometry === 'circle'}
			>
				{#if image.attribution}
					<span class="oveflow-hidden mr-1 text-ellipsis whitespace-nowrap">
						<span class="mr-0.5">©</span>
						{image.attribution}
					</span>
				{/if}
				<span
					class="overflow-hidden text-ellipsis whitespace-nowrap"
					use:popover={{ title: image?.usageAndAccessPolicy.title }}
				>
					<InfoIcon style="display: inline; font-size: 13px" />
					<span class="ml-0.5">
						{#if image.usageAndAccessPolicy.link}
							<a href={image.usageAndAccessPolicy.link}>{$page.data.t('general.usagePolicy')}</a>
						{:else}
							{$page.data.t('general.usagePolicy')}
						{/if}
					</span>
				</span>
			</figcaption>
		{/if}
	</figure>
{:else if showPlaceholder}
	<div class="flex items-center justify-center">
		<img
			src={placeholder}
			alt=""
			class="h-20 w-20 object-cover"
			class:rounded-sm={geometry !== 'circle'}
			class:rounded-full={geometry === 'circle'}
		/>
		{#if getTypeIcon(type)}
			<svelte:component this={getTypeIcon(type)} class="absolute text-2xl text-icon" />
		{/if}
	</div>
{/if}
