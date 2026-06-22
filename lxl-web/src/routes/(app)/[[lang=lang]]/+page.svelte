<script lang="ts">
	import type { FeaturedSearch } from '$lib/remotes/homepage.remote';
	import getPageTitle from '$lib/utils/getPageTitle';
	import Meta from '$lib/components/Meta.svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import IconArrowRight from '~icons/bi/arrow-right';
	import FeaturedPreviewList from './FeaturedPreviewList.svelte';
	import FeaturedCategories from './FeaturedCategories.svelte';

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

{#snippet featuredSearch(featured: FeaturedSearch, index: number)}
	{@const id = `${uid}-featured-search-${index + 1}`}
	<section
		class={[
			'featured-preview-section mb-4 flex flex-col gap-3 first-of-type:mt-0 last-of-type:pb-6 sm:mb-12 2xl:mb-16 @lg:gap-4.5 @5xl:gap-4.5 @min-[110rem]:gap-6'
		]}
	>
		<header class="flex flex-col px-3 lg:px-6 2xl:px-8">
			<h2
				class="font-serif text-lg @lg:text-xl @3xl:text-2xl @7xl:text-[1.625rem] @min-[110rem]:text-3xl"
				{id}
			>
				<a
					href={resolve(page.data.localizeHref(featured.findHref))}
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
					href={resolve(page.data.localizeHref(featured.findHref))}
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
				{featured}
				ariaLabelledBy={id}
				lazyload={index === 0 ? 'mount' : 'intersection'}
			/>
		</div>
		{#if featured.footerTextByLang}
			<footer class="mt-2 flex justify-start px-3 sm:justify-end @sm:px-6 @5xl:px-8">
				<a
					href={resolve(page.data.localizeHref(featured.findHref))}
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
<FeaturedCategories />
{#each featuredSearches as featured, index (featured.heading)}
	{@render featuredSearch(featured, index)}
{/each}
{#each featuredCollections as collection (collection.heading)}
	{@render featuredSearch(collection, 0, true)}
{/each}
{#each featuredSearches2 as featured, index (featured.heading)}
	{@render featuredSearch(featured, featuredSearches.length + featuredCollections.length + index)}
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
</style>
