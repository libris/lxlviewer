<script lang="ts">
	import type { FeaturedSearch } from '$lib/remotes/homepage.remote';
	import getPageTitle from '$lib/utils/getPageTitle';
	import Meta from '$lib/components/Meta.svelte';
	import { page } from '$app/state';
	import IconArrowRight from '~icons/bi/arrow-right';
	import FeaturedPreviewList from './FeaturedPreviewList.svelte';
	import FeaturedCategories from './FeaturedCategories.svelte';
	import heroImage from '$lib/assets/img/bg-marbling01.jpg';

	const uid = $props.id();
	const featuredSearches: FeaturedSearch[] = $derived(page.data.featuredSearches);
	const featuredSearches2: FeaturedSearch[] = $derived(page.data.featuredSearches2);
	const featuredCollections: FeaturedSearch[] = $derived(page.data.featuredCollections);
</script>

<svelte:head>
	<title>{getPageTitle(undefined, page.data.siteName)}</title>
</svelte:head>

<Meta
	title={page.data.siteName}
	description={page.data.t('home.metaDescription')}
	url={page.url.href}
	siteName={getPageTitle(undefined, page.data.siteName)}
/>

{#snippet featuredSearch(featured: FeaturedSearch, index: number, landscape: boolean = false)}
	{@const id = `${uid}-featured-search-${index + 1}`}
	<section
		class={[
			'featured-preview-section my-3 flex flex-col gap-3 last-of-type:pb-6 @lg:gap-4.5 @5xl:my-6 @5xl:gap-4.5 @5xl:first-of-type:mt-8 @5xl:last-of-type:pb-10 @min-[110rem]:gap-6',
			landscape && 'landscape-mode bg-neutral-100 py-6'
		]}
	>
		<header class="flex flex-col px-3 @sm:px-6 @5xl:px-20">
			<h2
				class="font-serif text-lg @lg:text-xl @3xl:text-2xl @7xl:text-[1.625rem] @min-[110rem]:text-3xl"
				{id}
			>
				<a
					href={page.data.localizeHref(featured.findHref)}
					class={[
						'ease-in-out hover:underline [&>svg]:mb-0.5 [&>svg]:transition-transform hover:[&>svg]:translate-x-1'
					]}
				>
					{featured.heading}
					<IconArrowRight class={['mx-0.5 inline size-4 transition-transform @5xl:size-5']} />
				</a>
			</h2>
			{#if featured.showAllLabel}
				<a
					href={page.data.localizeHref(featured.findHref)}
					class="btn btn-ghost text-sm hover:underline"
				>
					{featured.showAllLabel}
				</a>
			{/if}
			{#if featured.leadingTextByLang}
				<p class="my-2">
					{featured.leadingTextByLang}
				</p>
			{/if}
		</header>
		<div class="featured-list-container">
			<FeaturedPreviewList
				featuredSearch={featured}
				ariaLabelledBy={id}
				lazyload={index === 0 ? 'mount' : 'intersection'}
			/>
		</div>
		{#if featured.footerTextByLang}
			<footer class="mt-2 flex justify-start px-3 sm:justify-end @sm:px-6 @5xl:px-20">
				<a
					href={page.data.localizeHref(featured.findHref)}
					class={[
						'ease-in-out hover:underline [&>svg]:mb-0.5 [&>svg]:transition-transform hover:[&>svg]:translate-x-1'
					]}
				>
					{featured.footerTextByLang}
					<IconArrowRight class={['mx-0.5 inline size-4 transition-transform']} />
				</a>
			</footer>
		{/if}
	</section>
{/snippet}
<section class="hero relative">
	<enhanced:img src={heroImage} alt="" class="hero-image h-auto w-full min-w-5xl object-cover" />
	<div class="hero-heading absolute top-0 z-10 grid h-full w-full items-center justify-center">
		<hgroup class="h-full w-full px-4 font-serif">
			<h1 class="mb-3 w-full leading-[1.125] tracking-[-0.0125em] italic">
				{page.data.t('home.pageHeadingTitle')}
				{#if page.data.t('home.pageHeadingTitleNoWrap') !== 'home.pageHeadingTitleNoWrap'}
					<span class="block whitespace-nowrap">
						{page.data.t('home.pageHeadingTitleNoWrap')}
					</span>
				{/if}
			</h1>
			<p class="text-2xl">
				Libris {page.data.t('home.pageHeadingDescription')}.
			</p>
		</hgroup>
	</div>
</section>
<FeaturedCategories />
{#each featuredSearches as featured, index (featured.heading)}
	{@render featuredSearch(featured, index)}
{/each}
{#each featuredCollections as collections, index (collections.heading)}
	{@render featuredSearch(collections, featuredSearches.length + index, true)}
{/each}
{#each featuredSearches2 as featured, index (featured.heading)}
	{@render featuredSearch(featured, featuredSearches.length + featuredCollections.length + index)}
{/each}

<style lang="postcss">
	@reference 'tailwindcss';

	.featured-list-container {
		& :global(.horizontal-list > ul > li) {
			&:global(:first-child) {
				margin-left: calc(var(--spacing) * 3);
				@variant @sm {
					margin-left: calc(var(--spacing) * 6);
				}
				@variant @5xl {
					margin-left: calc(var(--spacing) * 20);
				}
			}
			&:global(:last-child) {
				margin-right: calc(var(--spacing) * 3);
				@variant @sm {
					margin-right: calc(var(--spacing) * 6);
				}
				@variant @5xl {
					margin-right: calc(var(--spacing) * 20);
				}
			}
		}

		@variant @5xl {
			& :global(.scroll-button) {
				width: calc(var(--spacing) * 13);
				height: calc(var(--spacing) * 13);

				&:global(:disabled) {
					@apply bg-neutral-100;
					@apply text-neutral-400/50;
				}
				&:global(.left) {
					margin-left: calc(var(--spacing) * 4);
				}

				&:global(.right) {
					margin-right: calc(var(--spacing) * 4);
				}
			}
		}
	}

	/* hide empty sections */
	.featured-preview-section:global(:has(.featured-previews.empty)) {
		display: none;
	}

	/* 'landscape mode' */
	:global(.featured-preview-section.landscape-mode .horizontal-list) {
		--card-scale: 1.4;

		&.with-gradient::before,
		&.with-gradient::after {
			background: none;
		}

		& .resource-image {
			aspect-ratio: 16 / 9;
		}

		& .resource-image > * {
			aspect-ratio: 16 / 9;
		}

		& img {
			width: 100%;
		}

		& .decorated-card-heading-top {
			display: none;
		}
	}

	.hero {
		--hero-height: calc(60.8vh - var(--appbar-height));
		--hero-height: calc(60.8vh - var(--appbar-height));
		--hero-margin: round(calc(var(--hero-height) / 2 - var(--appbar-height) / 2), 1px);

		height: var(--hero-height);
		background-color: var(--color-primary-300);
	}

	.hero-image {
		width: 100%;
		height: 100%;
		opacity: 1;
	}

	.hero-heading {
		display: none;
	}
</style>
