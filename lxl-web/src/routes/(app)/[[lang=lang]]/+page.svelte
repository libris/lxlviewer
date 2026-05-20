<script module>
	export const ID_HERO_SEARCH = 'hero-search';
</script>

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { FeaturedSearch } from '$lib/remotes/homepage.remote';
	import getPageTitle from '$lib/utils/getPageTitle';
	import Meta from '$lib/components/Meta.svelte';
	import { page } from '$app/state';
	import IconSearch from '~icons/bi/search';
	import IconArrowDown from '~icons/bi/arrow-down';
	import IconArrowRight from '~icons/bi/arrow-right';
	import FeaturedPreviewList from './FeaturedPreviewList.svelte';
	import FeaturedCategories from './FeaturedCategories.svelte';
	import heroImage from '$lib/assets/img/bg-marbling01.jpg';
	import AppSearch from './AppSearch.svelte';
	import { getHomepageContext } from '$lib/contexts/homepage';
	import { resolve } from '$app/paths';
	import { prefersReducedMotion } from 'svelte/motion';

	const ID_HERO_SEARCH_LABEL = 'hero-search-label';
	const ID_HERO_EXPLORE_LABEL = 'hero-explore-label';
	const ID_EXPLORE = 'explore';
	const ID_ABOUT = 'about';

	const featuredSearches: FeaturedSearch[] = $derived(page.data.featuredSearches);
	const featuredSearches2: FeaturedSearch[] = $derived(page.data.featuredSearches2);
	const featuredCollections: FeaturedSearch[] = $derived(page.data.featuredCollections);

	const homepageContext = getHomepageContext();
	let searchContainerElement: HTMLDivElement | undefined = $state();
	let searchObserver: IntersectionObserver | undefined = $state();

	function handleClickExplore(event: MouseEvent) {
		if (!prefersReducedMotion.current) {
			event.preventDefault();
			document.getElementById(ID_EXPLORE)?.scrollIntoView({ behavior: 'smooth' });
		}
	}

	function handleObserve(entries: IntersectionObserverEntry[]) {
		homepageContext.showSearchInAppBar = !entries[0].isIntersecting;
	}

	onMount(() => {
		searchObserver = new IntersectionObserver(handleObserve, { threshold: 1 });
		if (searchContainerElement) {
			searchObserver.observe(searchContainerElement);
		}
	});

	onDestroy(() => {
		searchObserver?.disconnect();
		homepageContext.showSearchInAppBar = false;
	});
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

{#snippet featuredSearchSection({
	featured,
	id,
	type,
	landscape,
	lazyload
}: {
	featured: FeaturedSearch;
	id: string;
	type: 'horizontal' | 'grid';
	landscape?: boolean;
	lazyload?: 'intersection' | 'mount';
})}
	<section
		class={[
			'featured-preview-section mb-16 flex flex-col gap-3 first-of-type:mt-6 last-of-type:pb-6 @lg:gap-4.5 @5xl:gap-4.5 @min-[110rem]:gap-6',
			landscape && 'landscape-mode bg-primary-50 py-6'
		]}
	>
		<header class="flex flex-col px-3 @7xl:px-8">
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
			<FeaturedPreviewList {featured} ariaLabelledBy={id} {type} {lazyload} />
		</div>
		{#if featured.footerTextByLang}
			<footer class="mt-2 flex justify-start px-3 sm:justify-end @sm:px-6 @5xl:px-8">
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
	<enhanced:img
		src={heroImage}
		alt=""
		class="hero-image absolute top-0 -z-10 h-auto w-full min-w-5xl flex-col object-cover"
	/>
	<div class="hero-content mx-auto flex w-full max-w-7xl flex-col justify-center gap-4 lg:mb-6">
		<h1
			id={ID_HERO_SEARCH_LABEL}
			class="text-page px-6 text-center font-serif text-4xl leading-[1.125] tracking-[-0.0125em] md:text-5xl lg:px-3"
		>
			{page.data.t('home.pageHeadingTitle')}
			{#if page.data.t('home.pageHeadingTitleNoWrap') !== 'home.pageHeadingTitleNoWrap'}
				<span class="whitespace-nowrap">
					{page.data.t('home.pageHeadingTitleNoWrap')}
				</span>
			{/if}
		</h1>
		<div
			id={ID_HERO_SEARCH}
			class="hero-search-container my-3 lg:my-6"
			bind:this={searchContainerElement}
		>
			<AppSearch id="hero-search" ariaLabelledBy={ID_HERO_SEARCH_LABEL} />
		</div>
		<div class="text-page flex justify-center gap-3 px-2">
			<button type="submit" class="shortcut btn-outlined">
				<div class="shortcut-icon">
					<IconSearch />
				</div>
				{page.data.t('home.searchLabel')}
			</button>
			<a
				id={ID_HERO_EXPLORE_LABEL}
				href={'#' + ID_EXPLORE}
				class="shortcut btn-outlined"
				onclick={handleClickExplore}
			>
				<div class="shortcut-icon">
					<IconArrowDown />
				</div>
				{page.data.t('home.exploreLabel')}
			</a>
			<a
				class="my-2 ml-2 flex items-center justify-center self-stretch border-l border-white/50 pl-6 text-sm font-medium text-shadow-lg 2xl:text-base"
				href={'#' + ID_ABOUT}
			>
				{page.data.t('home.aboutLabel')}
			</a>
		</div>
	</div>
</section>
<p class="text-subtle mt-6 mb-7.5 px-2 text-center font-serif text-base lg:px-3 2xl:text-lg">
	{page.data.t('home.pageDescriptionTitle1')}
	{page.data.t('home.pageDescriptionTitle2')}
</p>
<hr class="mx-auto w-full max-w-72 border-neutral-400" />
<section id={ID_EXPLORE} class="explore pt-6" aria-labelledby={ID_HERO_EXPLORE_LABEL}>
	<FeaturedCategories />
	{#each featuredSearches as featured, index (featured.heading)}
		{@render featuredSearchSection({
			featured,
			id: `featured-search-${index}`,
			type: 'horizontal',
			lazyload: index > 0 ? 'mount' : undefined
		})}
	{/each}
</section>
<section id={ID_ABOUT} class="bg-primary-50 mb-8 scroll-mt-20 py-16 2xl:py-24">
	<!--
	<h2
		class="mb-4.5 px-6 text-center font-serif text-4xl leading-tight tracking-[-0.0125em] lg:px-3"
	>
		<span class="whitespace-nowrap"> {page.data.t('home.aboutTitle1')} </span>
		<span class="block whitespace-nowrap">{page.data.t('home.aboutTitle2')}</span>
	</h2>
	<p class="text-primary-950/90 mx-auto max-w-2xl text-center 2xl:text-lg">
		{page.data.t('home.aboutParagraph1')}
		{page.data.t('home.aboutParagraph2')}
	</p>
	<div class="my-6 text-center">
		<a
			class="btn-outline text-page inline-flex min-h-11 items-center rounded-full bg-black/75 px-6 text-sm font-medium"
			href={page.data.localizeHref(resolve('/(app)/[[lang=lang]]/about', { lang: undefined }))}
		>
			{page.data.t('home.readMoreAbout')}
		</a>
	</div>
	<hr class="border-primary-700/75 mx-auto my-8 max-w-48 2xl:my-16" />
	-->
	<section class="2xl:max-w-10xl mx-auto max-w-7xl px-2 lg:px-3">
		<h3
			class="mb-4.5 px-6 text-center font-serif text-3xl leading-tight tracking-[-0.0125em] lg:px-3"
		>
			Särskilda samlingar
		</h3>
		<p class="text-primary-950/90 mx-auto max-w-2xl text-center 2xl:text-lg">
			I Libris finns även deldatabaser som omfattar nationalbibliografiska, ämnesspecialiserade och
			lokala/regionala bibliografier.
		</p>
		<div class="mx-auto mt-8">
			{#each featuredCollections as collection (collection.heading)}
				<FeaturedPreviewList
					featured={collection}
					ariaLabelledBy={collection.heading}
					type="grid"
				/>
			{/each}
			<div class="mt-6 text-center">
				<a
					class="btn-outline text-page inline-flex min-h-11 items-center rounded-full bg-black/75 px-6 text-sm font-medium"
					href={page.data.localizeHref(
						resolve('/(app)/[[lang=lang]]/collections', { lang: undefined })
					)}
				>
					Utforska särskilda samlingar
				</a>
			</div>
		</div>
	</section>
</section>
{#each featuredSearches as featured, index (featured.heading)}
	{@render featuredSearchSection({
		featured,
		type: 'horizontal',
		id: `featured-search-${featuredSearches2.length + index}`,
		lazyload: 'intersection'
	})}
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
				/*

				@variant @5xl {
					margin-left: calc(var(--spacing) * 20);
				}
					*/
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
		--hero-height: round(39.2vh, 1px);
		--hero-height: round(39.2svh, 1px);
		--hero-margin: round(calc(var(--hero-height) / 2), 1px);

		height: var(--hero-height);
		min-height: 320px;
		overflow: hidden;

		@variant lg {
			--hero-height: round(60.8vh, 1px);
			--hero-height: round(60.8svh, 1px);
			display: grid;

			grid-template-areas: var(--appbar-template-areas);
			grid-template-columns: var(--appbar-template-columns);
		}

		@variant 2xl {
			--hero-height: round(calc(60.8vh - var(--appbar-height)), 1px);
			--hero-height: round(calc(60.8svh - var(--appbar-height)), 1px);
		}
	}

	.hero-content {
		@variant lg {
			grid-area: search;
		}
	}

	.shortcut {
		@apply flex min-h-11 items-center border border-black/15 bg-black/30 pr-6 text-sm font-medium whitespace-nowrap text-white shadow-2xl backdrop-blur-sm text-shadow-lg hover:border-white/90 active:border-white motion-safe:transition-colors 2xl:min-h-13 2xl:gap-1 2xl:pr-7 2xl:pl-1 2xl:text-base;

		&:hover {
			@apply bg-black/15;
			& .shortcut-icon {
				@apply text-white;
			}
		}
	}

	.shortcut-icon {
		@apply flex aspect-square h-full items-center justify-center rounded-full px-2 text-white/75 transition-colors;
	}

	.hero-image {
		width: 100%;
		height: 100%;
		opacity: 1;
	}

	.explore {
		scroll-margin-top: var(--appbar-height);
	}

	.hero-search-container {
		min-height: var(--appbar-height);
	}
</style>
