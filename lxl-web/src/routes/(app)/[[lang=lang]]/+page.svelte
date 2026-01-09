<script lang="ts">
	import { onMount } from 'svelte';
	import getPageTitle from '$lib/utils/getPageTitle';
	import Meta from '$lib/components/Meta.svelte';
	import { page } from '$app/state';
	import IconSearch from '~icons/bi/search';
	import IconArrowDown from '~icons/bi/arrow-down';

	let mounted: boolean = $state(false);

	onMount(() => {
		mounted = true;
	});

	function handleClickSearch(event: MouseEvent) {
		event.preventDefault();
		//appSearchComponent?.showExpandedSearch({ cursorAtEnd: true });
	}
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

<header class="centered">
	<div class="py-6">
		<hgroup>
			<h1 class="font-mono font-medium tracking-widest uppercase">Libris</h1>
			<p class="my-2 max-w-[20ch] text-4xl leading-none lg:text-6xl 2xl:text-7xl">
				Utforska Sveriges biblioteks samlingar
			</p>
			<p class="text-2xl">
				Sök i
				<svelte:element
					this={mounted ? 'button' : 'a'}
					type={mounted ? 'button' : undefined}
					href={mounted ? undefined : '#search'}
					role={mounted ? undefined : 'button'}
					class="text-link hover:underline"
					onclick={handleClickSearch}
				>
					<IconSearch class="mx-0.5 mb-0.5 inline size-4.5" /> Libris
				</svelte:element>
				eller någon av
				<a href="#" class="text-link hover:underline">
					deldatabaserna <IconArrowDown class="mx-0.5 mb-0.5 inline size-4.5" />
				</a>
			</p>
		</hgroup>
		<hr class="my-6 w-1/3" />
		<hgroup>
			<nav>
				<h2 class="text-sm tracking-widest uppercase">Genvägar</h2>
				<ul class="text-link my-3 flex gap-4">
					<li>Sökhjälp</li>
					<li>Sökhistorik</li>
				</ul>
			</nav>
		</hgroup>
	</div>
</header>
<section class="centered my-6">
	<div class="w-full border-b border-neutral-500 pb-6">
		<h2 class="tracking-widest uppercase">Kategorier</h2>
		<ul class="my-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
			{#each ['Facklitteratur', 'Skönlitteratur', 'Stillbild', 'Mjukvara', 'Musik', 'Rörlig bild', 'Blandat material', 'Föremål'] as item (item)}
				<li class="rounded-md border border-neutral-100 bg-neutral-50 p-4">{item}</li>
			{/each}
		</ul>
	</div>
</section>
<section class="centered my-4">
	<div class="w-full border-b border-neutral-500 pb-6">
		<h2 class="heading text-3xl">Nyutgivet på svenska</h2>
		<ul class="my-4 grid grid-cols-3 gap-4 lg:grid-cols-6">
			{#each ['a', 'b', 'c', 'd', 'e', 'f'] as item (item)}
				<li class="aspect-[3/4] rounded-md border border-neutral-100 bg-neutral-50 p-4">{item}</li>
			{/each}
		</ul>
	</div>
</section>
<section class="centered my-4">
	<div class="w-full border-b border-neutral-500 pb-6">
		<h2 class="heading text-2xl">Lorem ipsum ad est dolores</h2>
		<ul class="my-4 grid grid-cols-3 gap-4 lg:grid-cols-6">
			{#each ['a', 'b', 'c', 'd', 'e', 'f'] as item (item)}
				<li class="aspect-[3/4] rounded-md border border-neutral-100 bg-neutral-50 p-4">{item}</li>
			{/each}
		</ul>
	</div>
</section>
<section class="centered my-4">
	<div class="w-full pb-6">
		<h2 class="heading text-2xl">Bläddra ämnesvis</h2>
		<ul class="my-4 grid grid-cols-6 gap-4 lg:grid-cols-6">
			{#each { length: 18 }}
				<li class="aspect-[2/1] rounded-md border border-neutral-100 bg-neutral-50 p-4"></li>
			{/each}
		</ul>
	</div>
</section>
<section class="centered bg-primary-50 mt-4">
	<div class="min-h-96 w-full rounded-xl py-8">
		<h2 class="heading mb-4 text-4xl">Om Libris</h2>
		<p class="mb-4 max-w-1/2 text-lg">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas vel viverra felis. Aliquam
			scelerisque metus sed lacinia placerat. Fusce euismod efficitur. Lorem ipsum dolor sit amet,
			consectetur adipiscing elit. Maecenas vel viverra florentin.
		</p>
		<a class="text-link" href="#">Läs mer om Libris</a>
		<hr class="my-6 w-1/3" />

		<h3 class="heading my-8 text-2xl">Deldatabaser</h3>
		<ul class="my-4 grid grid-cols-3 gap-4">
			{#each { length: 6 }, index}
				<li
					class={index === 5
						? ['grid grid-cols-2 gap-4']
						: ['bg-page aspect-[2/1] rounded-md border border-neutral-100 p-4']}
				>
					{#if index === 5}
						{#each { length: 4 }}
							<div class={['bg-page aspect-[2/1] rounded-md border border-neutral-100 p-4']} />
						{/each}
					{/if}
				</li>
			{/each}
		</ul>
	</div>
</section>

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

	header {
		background: var(--color-neutral-100);
		min-height: calc(38.2vh + var(--app-bar-height) + var(--banner-height, 0));
		align-items: center;
	}

	hgroup {
		& h1 {
		}
		& p {
			font-family: 'KB Serif Display 06';
		}
	}

	.heading {
		font-family: 'KB Serif Display 06';
	}
</style>
