<script lang="ts">
	import logo from '$lib/assets/libris_logotyp.gif';
	import Search from '$lib/components/Search.svelte';
	import type { PageData } from '../$types';

	export let data: PageData;
</script>

<main>
	<div class="hero">
		<img class="logo" src={logo} width={125} height={25} alt="LIBRIS" />
		<h1>Sök i Sveriges gemensamma bibliotekskatalog.</h1>
		<div class="search">
			<Search tabindex={1} autofocus />
		</div>
		<div class="links">
			<a href="/subjects">Bläddra ämnesvis</a> • <a href="/about">Läs mer om Libris</a>
		</div>
	</div>
	<section class="featured">
		<header>
			<h2>Utforska ämnen i katalogen:</h2>
			<h3>Skönlitteratur</h3>
		</header>
		<ul class="featured-list">
			{#each data.featuredSubjects as { label, link }}
				<li>
					<a href={link}>
						{label}
					</a>
				</li>
			{/each}
		</ul>
		<footer>
			<a href="/subjects">Utforska fler ämnen inom skönlitteratur</a>
			<br />
			<a href="/subjects">Bläddra bland alla ämnen</a>
		</footer>
	</section>
</main>

<style lang="scss">
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 61.8vh;
		padding: var(--padding-page);
	}

	.logo {
		display: block;
		width: 100%;
		height: auto;
		max-width: 180px;
		margin-bottom: 1.5rem;

		@media screen and (min-width: $layout-breakpoint-medium) {
			max-width: 250px;
			margin-bottom: 2rem;
		}
	}

	.search {
		display: grid;
		grid-template-columns: minmax(auto, 640px);
		margin: 1.25rem 0;
	}

	h1 {
		font-size: inherit;
		font-weight: normal;
		text-align: center;
		margin: 0;
	}

	.links {
		font-size: var(--font-size-small);
	}

	.featured {
		font-size: var(--font-size-small);

		header,
		footer {
			padding: 0 var(--padding-page);

			@media screen and (min-width: $layout-breakpoint-medium) {
				padding: 0;
			}
		}

		h2 {
			font-size: inherit;
			font-weight: inherit;
			margin: 0.5rem 0;
		}

		h3 {
			font-size: 1rem;
			margin: 0;
		}

		@media screen and (min-width: $layout-breakpoint-medium) {
			max-width: 1280px;
			margin: 0 auto 10vh auto;
			padding: var(--padding-page);
		}

		@media screen and (min-width: $layout-breakpoint-3x-large) {
			max-width: 1600px;
		}
	}

	.featured-list {
		list-style-type: none;
		display: grid;
		grid-template-columns: repeat(6, minmax(61.8vw, 240px));
		gap: 1rem;
		padding: 0 var(--padding-page);
		font-size: var(--font-size-smaller);
		margin: 1.5rem auto;
		white-space: nowrap;
		overflow: auto;
		scrollbar-width: none;

		::-webkit-scrollbar {
			display: none;
		}

		@media screen and (min-width: $layout-breakpoint-medium) {
			padding: 0;
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.featured-list li a {
		display: flex;
		align-items: flex-end;
		aspect-ratio: 16 / 10;
		background: #fff;
		border-radius: 5px;
		padding: 1rem;
		box-shadow: 0 0 0 1px rgb(112 112 112 / 0.06);
	}
</style>
