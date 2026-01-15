<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import Meta from '$lib/components/Meta.svelte';
	import { page } from '$app/state';
	import { getFeaturedSearches } from './homepage.remote';
	import SearchResultList from '$lib/components/SearchResultList.svelte';
	import IconArrowRight from '~icons/bi/arrow-right';

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

<header class="page-header bg-primary-100 flex items-center px-3 @sm:px-6">
	<div class="col-start-2 col-end-3 mb-4 w-full max-w-7xl">
		<hgroup>
			<h1
				class="mb-2 text-2xl @md:text-[1.6875rem] @3xl:text-4xl @3xl:tracking-[-0.0125rem] @7xl:text-[3.25rem]"
			>
				{page.data.t('home.pageHeadingTitle')}
			</h1>
			<p class="text-body/87.5 max-w-[40ch] text-sm @3xl:text-base @7xl:max-w-none">
				{page.data.t('home.pageHeadingDescription')}
			</p>
		</hgroup>
	</div>
</header>
{#each await getFeaturedSearches() as featured, index (featured.headingByLang.sv)}
	{@const id = `${uid}-featured-search-${index + 1}`}
	<section class="my-3 flex flex-col gap-3 @sm:my-6 @sm:gap-6 @5xl:my-8 @5xl:gap-8">
		<header class="flex justify-between px-3 @sm:px-6 @5xl:px-20">
			<h2 class="text-lg @lg:text-xl @3xl:text-2xl" {id}>
				<a
					href={page.data.localizeHref(featured.findHref)}
					class="ease-in-out hover:underline hover:[&>svg]:translate-x-1"
				>
					{featured.headingByLang[page.data.locale]}
					{#if !featured.showAllLabelByLang}
						<IconArrowRight class="ml-1 inline size-4 transition-transform" />
					{/if}
				</a>
			</h2>
			{#if featured.showAllLabelByLang}
				<a
					href={page.data.localizeHref(featured.findHref)}
					class="text-sm hover:underline hover:[&>svg]:translate-x-1"
				>
					{featured.showAllLabelByLang[page.data.locale]}
					<IconArrowRight class="ml-1 inline-flex size-4 transition-transform" />
				</a>
			{/if}
		</header>
		<SearchResultList items={featured.items} type="horizontal" ariaLabelledBy={id} />
	</section>
{/each}

<style lang="postcss">
	@reference 'tailwindcss';

	.page-header {
		min-height: calc(38.2vh + var(--banner-height, 0));

		@variant @md {
			padding-inline: calc(var(--spacing) * 14);
		}

		@variant @5xl {
			display: grid;
			grid-template-columns: var(--search-grid-template-columns);
			gap: var(--search-gap);
			padding: var(--search-padding);

			& hgroup {
				padding-inline: calc(var(--spacing) * 4);
			}
		}
	}

	h1 {
		font-family: 'KB Serif Display 06';
	}

	h2 {
		font-family: 'KB Serif Display 06';
	}
</style>
