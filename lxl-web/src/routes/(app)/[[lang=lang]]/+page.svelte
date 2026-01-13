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
	description={page.data.t('home.pageDescription')}
	url={page.url.href}
	siteName={getPageTitle(undefined, page.data.siteName)}
/>

<header class="page-header centered">
	<div class="py-6">
		<hgroup>
			<h1 class="my-2 max-w-[20ch] text-4xl leading-none lg:text-6xl 2xl:text-7xl">
				Utforska Sveriges biblioteks samlingar
			</h1>
			<p class="text-xl">
				Libris är de svenska bibliotekens gemensamma katalog med över 9 miljoner titlar.
			</p>
		</hgroup>
		<nav class="my-6">
			<h2 class="my-4 w-fit border-t pt-4 tracking-widest uppercase">Genvägar</h2>
			<ul>
				<li>
					<div class="text-lg">
						<li class="inline after:mx-2 after:content-['_·_']">
							<a href="#" class="text-link">Hitta mitt bibliotek</a>
						</li>
						<li class="inline after:mx-2 after:content-['_·_']">
							<a href="#" class="text-link">Sök i deldatabaser</a>
						</li>
						<li class="inline"><a href="#" class="text-link">Läs mer om Libris</a></li>
					</div>
				</li>
			</ul>
		</nav>
	</div>
</header>
<section class="centered my-6">
	<h2 class="tracking-widest uppercase">Kategorier</h2>
	<ul class="my-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
		{#each ['Facklitteratur', 'Skönlitteratur', 'Stillbild', 'Mjukvara', 'Musik', 'Rörlig bild', 'Blandat material', 'Föremål'] as item (item)}
			<li class="rounded-md border border-neutral-100 bg-neutral-50 p-4">{item}</li>
		{/each}
	</ul>
</section>
<hr class="centered block" />
{#each await getFeaturedSearches() as featured, index (featured.headingByLang.sv)}
	{@const id = `${uid}-featured-search-${index + 1}`}
	<section class="centered">
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

	hr {
		margin: calc(var(--spacing) * 8) auto;
		width: 66.6%;
	}
	.page-header {
		background: var(--color-neutral-100);
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
