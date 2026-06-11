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
	import heroImage from '$lib/assets/img/bg-marbling01.jpg';
	import AppSearch from './AppSearch.svelte';
	import { getHomepageContext } from '$lib/contexts/homepage';
	import { resolve } from '$app/paths';
	import { prefersReducedMotion } from 'svelte/motion';
	import { getCategoryShortcuts } from '$lib/remotes/homepage.remote';

	const ID_HERO_SEARCH_LABEL = 'hero-search-label';
	const ID_HERO_EXPLORE_LABEL = 'hero-explore-label';
	const ID_EXPLORE = 'explore';
	const ID_CATEGORIES_LABEL = 'categories-label';

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
			'featured-preview-section mb-4 flex flex-col gap-3 first-of-type:mt-0 last-of-type:pb-6 sm:mb-12 2xl:mb-16 @lg:gap-4.5 @5xl:gap-4.5 @min-[110rem]:gap-6',
			landscape && 'landscape-mode bg-primary-50 py-6'
		]}
	>
		<header class="flex flex-col px-3 lg:px-6 2xl:px-8">
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
<section class="hero relative min-h-60 sm:min-h-80">
	<enhanced:img
		src={heroImage}
		alt=""
		class="hero-image absolute top-0 -z-10 h-auto w-full min-w-5xl flex-col object-cover"
	/>
	<div class="hero-content mx-auto h-full w-full justify-center gap-3 sm:gap-4.5 2xl:gap-5">
		<div class="flex flex-1 items-end justify-center">
			<h1
				id={ID_HERO_SEARCH_LABEL}
				class="text-primary-50 mt-7.5 px-4.5 text-center font-serif text-3xl leading-snug tracking-[-0.0125em] text-shadow-md sm:text-4xl lg:leading-none xl:text-5xl 2xl:text-[3.25rem]"
			>
				{page.data.t('home.pageHeadingTitle')}
				{#if page.data.t('home.pageHeadingTitleNoWrap') !== 'home.pageHeadingTitleNoWrap'}
					<span class="whitespace-nowrap">
						{page.data.t('home.pageHeadingTitleNoWrap')}
					</span>
				{/if}
			</h1>
		</div>
		<div class="hero-search-container z-0 mx-2 lg:mx-0" bind:this={searchContainerElement}>
			<AppSearch id={ID_HERO_SEARCH} ariaLabelledBy={ID_HERO_SEARCH_LABEL} />
		</div>
		<div class="text-primary-50 mx-auto flex w-full flex-1 flex-col justify-between gap-6">
			<div
				class="mx-auto flex w-full max-w-xl justify-center gap-2 px-3 *:min-h-11 *:flex-1 *:bg-black/25 *:px-4 sm:gap-3 sm:px-14 sm:*:min-h-13 2xl:*:min-h-14 2xl:*:text-base!"
			>
				<button
					type="submit"
					form={`${ID_HERO_SEARCH}-form`}
					class="shortcut btn-outlined shadow-2xs"
				>
					<div class="shortcut-icon">
						<IconSearch />
					</div>
					{page.data.t('home.searchLabel')}
				</button>
				<a
					id={ID_HERO_EXPLORE_LABEL}
					href={'#' + ID_EXPLORE}
					class="shortcut btn-outlined shadow-2xs"
					onclick={handleClickExplore}
				>
					<div class="shortcut-icon">
						<IconArrowDown />
					</div>
					{page.data.t('home.exploreLabel')}
				</a>
			</div>
			<div class="hero-description relative mx-auto w-full">
				<div
					class="top absolute top-0 right-0 left-0 -z-10 mx-auto h-full w-2/3 mask-radial-from-30% mask-radial-to-100% mask-radial-at-[50%_75%] backdrop-blur-sm 2xl:mask-radial-from-15%"
				></div>
				<p
					class="text-primary-100/90 mx-auto w-full px-3 py-4.5 pt-12 text-center leading-snug sm:pb-6 2xl:pt-16 2xl:pb-7.5"
				>
					<span class="text-sm font-medium lg:text-[1.0625rem] 2xl:text-lg">
						<span>{page.data.t('home.pageDescription1')}</span>
						{page.data.t('home.pageDescription2')}
						<span class="mx-0.75">{' · '}</span>

						<a
							class="text-page text-sm font-medium underline hover:decoration-solid focus:decoration-solid lg:decoration-dotted"
							href={page.data.localizeHref(
								resolve('/(app)/[[lang=lang]]/about', { lang: undefined })
							)}
						>
							{page.data.t('home.pageDescriptionReadMore1')}
							<span class="sr-only">{page.data.t('home.pageDescriptionReadMore2')}</span>
						</a>
					</span>
				</p>
			</div>
		</div>
	</div>
</section>
<section id={ID_EXPLORE} class="explore" aria-labelledby={ID_HERO_EXPLORE_LABEL}>
	<nav
		aria-labelledby={ID_HERO_EXPLORE_LABEL}
		class="categories scrollbar-hidden items-center overflow-x-scroll py-4.5 lg:grid lg:py-6"
	>
		<h2
			id={ID_CATEGORIES_LABEL}
			class="text-placeholder pl-3 text-xs font-medium tracking-widest uppercase lg:pl-6 lg:text-sm 2xl:pl-8"
		>
			{page.data.t('home.categories')}
		</h2>
		<ul
			class="flex gap-1.5 text-sm *:first:ml-3 *:last:mr-3 lg:mx-auto lg:gap-1.5 lg:text-[0.9375rem] 2xl:text-base"
		>
			{#each await getCategoryShortcuts(page.data.locale) as category (category.id)}
				<li>
					<a
						href={page.data.localizeHref(category.href)}
						id={category.id}
						aria-labelledby="search-for {category.id}"
						class="btn-outlined text-subtle focus-visible:bg-primary-200 hover:bg-primary-200/50 min-w-12 border-neutral-300 bg-transparent px-2 py-2 text-center font-medium whitespace-nowrap -outline-offset-2 md:py-1.5 @xl:px-3 @xl:py-2 @3xl:min-w-14 @5xl:min-h-10 @5xl:min-w-16"
					>
						{category.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
	<hr class={['border-neutral mx-6 mb-6  2xl:mx-8 2xl:mb-8']} />
	{#each featuredSearches as featured, index (featured.heading)}
		{@render featuredSearchSection({
			featured,
			id: `featured-search-${index}`,
			type: 'horizontal',
			lazyload: index > 0 ? 'mount' : undefined
		})}
	{/each}
</section>
<section class="bg-primary-50 mb-8 scroll-mt-20 px-3 py-12 lg:py-16">
	<div class="2xl:max-w-10xl mx-auto max-w-7xl">
		<h2 class="mb-4.5 px-6 text-center font-serif text-2xl lg:text-3xl @min-[110rem]:text-4xl">
			{page.data.t('home.collectionsTitle')}
		</h2>
		<p class="text-primary-950/90 mx-auto max-w-2xl text-center 2xl:text-lg">
			{page.data.t('home.collectionsDescription')}
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
					class="btn-outline text-page inline-flex min-h-11 items-center rounded-full bg-black/75 px-6 text-sm font-medium focus-within:bg-black hover:bg-black"
					href={page.data.localizeHref(
						resolve('/(app)/[[lang=lang]]/collections', { lang: undefined })
					)}
				>
					{page.data.t('home.collectionsReadMore')}
				</a>
			</div>
		</div>
	</div>
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
				@apply ml-3;
				@variant lg {
					@apply ml-6;
				}

				@variant 2xl {
					@apply ml-8;
				}
			}
			&:global(:last-child) {
				@apply mr-3;

				@variant lg {
					@apply mr-6;
				}

				@variant 2xl {
					@apply mr-6;
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
		overflow: hidden;
		--hero-height: round(min(100vw, 60.8vh), 1px);
		--hero-height: round(min(100vw, 60.8svh), 1px);
		height: var(--hero-height);
		min-height: 400px;

		@variant sm {
			--hero-height: round(60.8vh, 1px);
			--hero-height: round(60.8svh, 1px);
		}
	}

	.hero-content {
		display: flex;
		flex-direction: column;
	}

	.shortcut {
		@apply flex items-center justify-center gap-3 overflow-hidden border border-black/15 text-xs font-medium whitespace-nowrap backdrop-blur-lg backdrop-brightness-90 text-shadow-lg hover:border-white/85 hover:backdrop-brightness-100 focus-visible:border-white/85 focus-visible:backdrop-brightness-100 active:brightness-80 motion-safe:transition-colors min-[25rem]:text-sm;

		&:hover,
		&:focus-visible {
			& .shortcut-icon {
				@apply text-white;
			}
		}
	}

	.shortcut-icon {
		@apply flex h-full items-center justify-center rounded-full text-white/75 transition-colors;
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

		@variant lg {
			display: grid;
			grid-template-areas: var(--appbar-template-areas);
			grid-template-columns: var(--appbar-template-columns);
		}

		& :global(#hero-search) {
			@variant lg {
				grid-area: search;
			}
		}
	}

	.categories {
		grid-template-columns: 1fr 5fr 1fr;
	}
</style>
