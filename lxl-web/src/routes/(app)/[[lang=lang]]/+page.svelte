<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import Meta from '$lib/components/Meta.svelte';
	import { page } from '$app/state';
	import IconArrowRight from '~icons/bi/arrow-right';
	import FeaturedPreviewList from './FeaturedPreviewList.svelte';

	const uid = $props.id();
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

{#each page.data.featuredSearches as featured, index (featured.heading)}
	{@const id = `${uid}-featured-search-${index + 1}`}
	<section
		class="my-3 flex flex-col gap-3 last-of-type:pb-6 @lg:gap-4.5 @5xl:gap-4.5 @5xl:first-of-type:mt-8 @5xl:last-of-type:pb-10 @min-[110rem]:gap-6"
	>
		<header class="flex justify-between px-3 @sm:px-6 @5xl:px-20">
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
		</header>
		<div class="featured-list-container">
			<FeaturedPreviewList
				featuredSearch={featured}
				ariaLabelledBy={id}
				lazyload={index === 0 ? 'mount' : 'intersection'}
			/>
		</div>
	</section>
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
</style>
