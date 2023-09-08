<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import IconMenu from '~icons/mdi/menu';
	import IconClose from '~icons/mdi/close';

	import Search from '$lib/components/Search.svelte';
	import logo from '$lib/assets/libris_logotyp.gif';

	export let sticky = true;
	export let withSearch = true;

	let clientRenderedMenuButton = false;
	let expandedMenu = false;

	onMount(() => {
		clientRenderedMenuButton = true;
	});

	afterNavigate(() => {
		expandedMenu = false;
	});

	function toggleMenu() {
		expandedMenu = !expandedMenu;
	}
</script>

<header class:with-search={withSearch} class:with-expanded-menu={expandedMenu} class:sticky>
	<div class="logo">
		<a href="/" title="Startsida">
			<img src={logo} width={141} height={25} alt="Startsida" />
		</a>
	</div>
	{#if clientRenderedMenuButton}
		<nav class="menu" id="menu">
			<ul>
				<li>
					<a href="/" aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
						Sök i Libris</a
					>
				</li>
				<li>
					<a href="/subjects" aria-current={$page.url.pathname === '/subjects' ? 'page' : undefined}
						>Bläddra ämnesvis</a
					>
				</li>
				<li>
					<a href="/saved" aria-current={$page.url.pathname === '/saved' ? 'page' : undefined}
						>Sparat</a
					>
				</li>
				<li>
					<a href="/signup" aria-current={$page.url.pathname === '/login' ? 'page' : undefined}
						>Logga in</a
					>
				</li>
				<li>
					<a href="/en">In English</a>
				</li>
				<li>
					<a href="/help" aria-current={$page.url.pathname === '/help' ? 'page' : undefined}
						>Hjälp</a
					>
				</li>
			</ul>
		</nav>
	{/if}
	{#if withSearch}
		<div class="search">
			<Search tabindex={1} />
		</div>
	{/if}
	<div class="actions">
		<nav aria-label="Shortcuts">
			<ul>
				<li>
					<a href="/" aria-current={$page.url.pathname === '/help' ? 'page' : undefined}>Hjälp</a>
				</li>
				<li>
					<a href="/" aria-current={$page.url.pathname === '/saved' ? 'page' : undefined}>Sparat</a>
				</li>
				<li>
					<a href="/" aria-current={$page.url.pathname === '/login' ? 'page' : undefined}
						>Logga in</a
					>
				</li>
				<li>
					<a href="/">In English</a>
				</li>
			</ul>
		</nav>
		{#if clientRenderedMenuButton}
			<button
				class="menu-toggle"
				on:click={toggleMenu}
				aria-expanded={expandedMenu}
				aria-controls="menu"
			>
				{#if expandedMenu}
					<IconClose width={24} height={24} />
				{:else}
					<IconMenu width={24} height={24} />
				{/if}
			</button>
		{:else}
			<a class="menu-toggle" href="#footer-menu"><IconMenu width={24} height={24} /></a>
		{/if}
	</div>
</header>

<style lang="scss">
	header {
		display: grid;
		grid-template-areas: 'logo actions';
		grid-template-columns: max-content auto;
		grid-auto-rows: var(--height-input);
		column-gap: var(--column-gap-header);
		row-gap: var(--row-gap-header);
		padding: var(--padding-header);
		box-sizing: border-box;
		background: #fff;
		box-shadow: 0 1px 0 var(--color-border);
	}

	.with-search {
		grid-template-areas:
			'logo actions'
			'search search';

		@media screen and (min-width: $layout-breakpoint-large) {
			grid-template-areas: 'logo search actions';
			grid-template-columns: 1fr 2fr 1fr;
		}
	}

	.with-expanded-menu {
		grid-template-areas:
			'logo actions'
			'menu menu';
		grid-template-rows: var(--height-input) auto;

		.menu {
			display: flex;
		}

		@media screen and (min-width: $layout-breakpoint-large) {
			grid-template-areas: 'logo actions';
			grid-template-rows: revert;

			.menu {
				display: none;
			}
		}
	}

	.with-search.with-expanded-menu {
		grid-template-areas:
			'logo actions'
			'menu menu';
		grid-template-rows: var(--height-input) auto;

		.search {
			display: none;
		}

		@media screen and (min-width: $layout-breakpoint-large) {
			grid-template-areas: 'logo search actions';
			grid-template-rows: revert;

			.menu {
				display: none;
			}

			.search {
				display: grid;
			}
		}
	}

	.sticky {
		position: sticky;
		top: 0;
	}

	.logo {
		grid-area: logo;

		a {
			display: flex;
			align-items: center;
			width: fit-content;
			height: var(--height-input);
		}

		img {
			display: block;
			width: 112px;
			height: auto;
		}
	}

	.menu-toggle {
		width: var(--height-input);
		height: var(--height-input);
		font-size: inherit;
		cursor: pointer;
		padding: 0;
		color: inherit;
		background: none;
		border: none;

		@media screen and (min-width: $layout-breakpoint-large) {
			display: none;
		}
	}

	.menu {
		grid-area: menu;
		display: none;
		flex-direction: column;
	}

	.search {
		grid-area: search;

		@media screen and (min-width: $layout-breakpoint-large) {
			display: grid;
			grid-template-columns: minmax(auto, 640px);
			justify-content: center;
		}
	}

	.actions {
		grid-area: actions;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
		white-space: nowrap;
		font-size: var(--font-size-smaller);
	}

	.actions ul {
		display: none;
		list-style-type: none;
		padding: 0;
		margin: 0;
		gap: 1rem;

		@media screen and (min-width: $layout-breakpoint-large) {
			display: flex;
		}
	}

	.menu ul {
		list-style-type: none;
		padding: 0;
		margin: 0;
	}

	.menu li {
		display: flex;
		align-items: center;
		height: var(--height-input);
	}
</style>
