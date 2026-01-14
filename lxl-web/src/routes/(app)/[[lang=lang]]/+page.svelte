<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import Meta from '$lib/components/Meta.svelte';
	import { page } from '$app/state';
	import IconBook from '~icons/bi/book';

	import IconCircle from '~icons/bi/plus-circle';
	import IconChevronDown from '~icons/bi/chevron-down';

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
	description={page.data.t('home.pageDescription')}
	url={page.url.href}
	siteName={getPageTitle(undefined, page.data.siteName)}
/>

<header class="page-header centered">
	<div class="py-6">
		<hgroup>
			<h1 class="my-2 text-4xl leading-none lg:text-6xl 2xl:text-6xl">
				Sök på alla svenska bibliotek
			</h1>
			<p class="text-lg">
				Libris är de svenska bibliotekens gemensamma katalog med över 9 miljoner titlar.
			</p>
		</hgroup>
		<input type="search" class="bg-page mt-6 mb-4 min-h-16 w-full max-w-[960px] rounded-lg" />

		<nav class="my-4 flex w-fit flex-col">
			<div class="flex gap-4 text-[0.9375rem]">
				<h2 class="text-sm tracking-widest uppercase">Sök efter</h2>
				<ul class="flex gap-3">
					<li>
						<a href="#" class="bg-page class flex items-center gap-1 rounded-full px-2 py-1"
							><IconBook />Skönlitteratur</a
						>
					</li>
					<li>
						<a href="#" class="bg-page class flex items-center gap-1 rounded-full px-2 py-1"
							><IconBook />Facklitteratur</a
						>
					</li>
					<li><a href="#" class="bg-page rounded-full px-2 py-2">Stillbild</a></li>
					<li><a href="#" class="bg-page rounded-full px-2 py-2">Musik</a></li>
					<li><a href="#" class="bg-page rounded-full px-2 py-2">Mjukvara</a></li>
					<li><a href="#" class="bg-page rounded-full px-2 py-2">Rörlig bild</a></li>
					<li><a href="#" class="bg-page rounded-full px-2 py-2">Föremål</a></li>
				</ul>
			</div>
			<hr class="my-4" />
			<ul class="flex gap-3">
				<li>
					<a href="#" class="bg-page class flex items-center gap-2 rounded-full px-2 py-1"
						>Författare/upphov:<IconCircle /></a
					>
				</li>
				<li>
					<a href="#" class="bg-page class flex items-center gap-2 rounded-full px-2 py-1"
						>Titel:<IconCircle /></a
					>
				</li>
				<li>
					<a href="#" class="bg-page class flex items-center gap-2 rounded-full px-2 py-1"
						>Språk:<IconCircle /></a
					>
				</li>
				<li>
					<a href="#" class="bg-page class flex items-center gap-2 rounded-full px-2 py-1"
						>Utgivningsår:<IconCircle /></a
					>
				</li>
				<li>
					<a href="#" class="bg-page class flex items-center gap-2 rounded-full px-2 py-1"
						>Fler filter<IconChevronDown /></a
					>
				</li>
			</ul>
		</nav>
		<!--<nav class="my-6">
			<h2 class="my-4 w-fit border-t pt-4 text-[0.9375rem] tracking-widest uppercase">Genvägar</h2>
			<ul>
				<li>
					<div class="text-lg">
						<li class="inline after:mx-2 after:content-['_·_']">
							<a href="#" class="text-link">Hitta mitt bibliotek</a>
						</li>
						<li class="inline"><a href="#" class="text-link">Läs mer om Libris</a></li>
					</div>
				</li>
			</ul>
		</nav>
	</div>
	-->
	</div>
</header>
{#each await getFeaturedSearches() as featured, index (featured.headingByLang.sv)}
	{@const id = `${uid}-featured-search-${index + 1}`}
	<section class="centered my-8">
		<header class="flex justify-between">
			<h2 class="heading mb-8 text-3xl" {id}>
				<a
					href={page.data.localizeHref(featured.findHref)}
					class="ease-in-out hover:underline hover:[&>svg]:translate-x-2"
				>
					{featured.headingByLang[page.data.locale]}
					{#if !featured.showAllLabelByLang}
						<IconArrowRight class="ml-1 inline size-5.5 transition-transform" />
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
		<div>
			<SearchResultList items={featured.items} type="horizontal" ariaLabelledBy={id} />
		</div>
	</section>
	<hr class="centered block" />
{/each}

<style lang="postcss">
	@reference 'tailwindcss';

	.centered {
		display: flex;
		padding-inline: calc(var(--spacing) * 4);

		@variant lg {
			display: grid;
			grid-template-columns: 1fr 4fr 1fr;
			padding-inline: 0;
			& > * {
				grid-column: 2;
			}
		}
	}

	.page-header {
		background: var(--color-primary-100);
		min-height: calc(38.2vh + var(--app-bar-height) + var(--banner-height, 0));
		align-items: center;
	}

	hgroup {
		& h1 {
			font-family: 'KB Serif Display 06';
		}
		& p:first-of-type {
		}
	}

	.heading {
		font-family: 'KB Serif Display 06';
	}
</style>
