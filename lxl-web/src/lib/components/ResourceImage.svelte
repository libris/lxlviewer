<script lang="ts">
	import { type Image, Width } from '$lib/types/auxd';
	import placeholder from '$lib/assets/img/placeholder.svg';
	import getTypeIcon from '$lib/utils/getTypeIcon';
	import { bestSize } from '$lib/utils/auxd';
	import { first } from '$lib/utils/xl';
	import { page } from '$app/stores';
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

{#if image && thumb}
	<figure class="3xl:h-64 table aspect-square h-64 overflow-hidden lg:h-56">
		{#if linkToFull && full}
			<a href={full.url} target="_blank" class="object-[inherit]">
				<img
					{alt}
					{loading}
					src={thumb.url}
					width={thumb.widthPx > 0 ? thumb.widthPx : undefined}
					height={thumb.heightPx > 0 ? thumb.heightPx : undefined}
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
				width={thumb.widthPx > 0 ? thumb.widthPx : undefined}
				height={thumb.heightPx > 0 ? thumb.heightPx : undefined}
				class="object-contain object-[inherit]"
				class:rounded-full={geometry === 'circle'}
			/>
		{/if}
		{#if image?.usageAndAccessPolicy}
			<figcaption
				class="text-3xs text-subtle mt-1 table-caption caption-bottom overflow-hidden"
				class:text-center={geometry === 'circle'}
			>
				{#if image.attribution}
					<span class="mr-1 truncate">
						<span class="mr-0.5">©</span>
						{#if image.attribution.link}
							<a href={image.attribution.link} target="_blank" class="ext-link">
								{image.attribution.name}
							</a>
						{:else}
							{image.attribution.name}
						{/if}
					</span>
					<!-- This could be based on if attribution required by license.
						For now, display if there is any attribution info available -->
					{#if geometry === 'circle'}
						{$page.data.t('general.cropped')}
					{/if}
				{/if}
				<span class="truncate" use:popover={{ title: image?.usageAndAccessPolicy.title }}>
					<InfoIcon style="display: inline; font-size: 13px" />
					<span class="ml-0.5">
						{#if image.usageAndAccessPolicy.link}
							<a href={image.usageAndAccessPolicy.link} target="_blank" class="ext-link">
								{#if image.usageAndAccessPolicy.identifier}
									{image.usageAndAccessPolicy.identifier}
								{:else}
									{$page.data.t('general.usagePolicy')}
								{/if}
							</a>
						{:else}
							{$page.data.t('general.usagePolicy')}
						{/if}
					</span>
				</span>
			</figcaption>
		{/if}
	</figure>
{:else if showPlaceholder}
	<div class="flex items-center justify-center object-[inherit]">
		<img
			src={placeholder}
			alt=""
			class="size-20 object-cover object-[inherit]"
			class:rounded-sm={geometry !== 'circle'}
			class:rounded-full={geometry === 'circle'}
		/>
		{#if getTypeIcon(type)}
			{@const SvelteComponent = getTypeIcon(type)}
			<SvelteComponent class="text-subtle absolute text-2xl" />
		{/if}
	</div>
{/if}
