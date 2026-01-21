<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import Meta from '$lib/components/Meta.svelte';
	import { page } from '$app/state';
	import { getFeaturedSearches } from '$lib/remotes/homepage.remote';
	import SearchResultList from '$lib/components/SearchResultList.svelte';
	import IconArrowRight from '~icons/bi/arrow-right';
	import type { Locales } from '$lib/i18n/locales';

	const uid = $props.id();

	const featuredSearches = $derived(await getFeaturedSearches(page.data.locale as Locales));
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

<header class="page-header bg-primary-100 flex items-center px-3 @sm:px-6">
	<div class="col-start-2 col-end-3 mx-auto mt-8 mb-12 w-full max-w-7xl @5xl:mt-12 @5xl:mb-16">
		<hgroup>
			<h1
				class="mb-2 font-serif text-2xl @md:text-[1.6875rem] @3xl:text-4xl @3xl:tracking-[-0.0125rem] @7xl:text-5xl"
			>
				{page.data.t('home.pageHeadingTitle')}
			</h1>
			<p
				class="text-body/87.5 max-w-[40ch] text-sm @3xl:text-base @7xl:max-w-none @min-[120rem]:text-lg"
			>
				{page.data.t('home.pageHeadingDescription')}
			</p>
		</hgroup>
	</div>
</header>
{#each await featuredSearches as featured, index (featured.heading)}
	{@const id = `${uid}-featured-search-${index + 1}`}
	<section
		class="@5xl-my-8 my-3 flex flex-col gap-3 last-of-type:pb-6 @sm:my-6 @lg:gap-4.5 @5xl:my-8 @5xl:gap-4.5 @5xl:last-of-type:pb-10 @min-[120rem]:gap-6"
	>
		<header class="flex justify-between px-3 @sm:px-6 @5xl:px-20">
			<h2
				class="font-serif text-lg @lg:text-xl @3xl:text-2xl @7xl:text-[1.625rem] @min-[120rem]:text-3xl"
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
			<SearchResultList items={featured.items} type="horizontal" ariaLabelledBy={id} withGradient />
		</div>
	</section>
{/each}

<style lang="postcss">
	@reference 'tailwindcss';

	.page-header {
		min-height: calc(38.2vh - var(--app-bar-height) - var(--banner-height, 0));

		@variant @md {
			padding-inline: calc(var(--spacing) * 14);
		}

		@variant @5xl {
			min-height: calc(38.2vh - var(--banner-height, 0));
			display: grid;
			grid-template-columns: var(--search-grid-template-columns);
			gap: var(--search-gap);
			padding: var(--search-padding);

			& hgroup {
				padding-inline: calc(var(--spacing) * 4);
			}
		}
	}

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
