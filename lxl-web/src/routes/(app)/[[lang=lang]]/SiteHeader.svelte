<script lang="ts">
	import { page } from '$app/state';
	import { beforeNavigate } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import HeaderMenu from './HeaderMenu.svelte';
	import SuperSearchWrapper from '$lib/components/supersearch/SuperSearchWrapper.svelte';
	import BiList from '~icons/bi/list';

	let showHeaderMenu = false;

	function toggleHeaderMenu() {
		showHeaderMenu = !showHeaderMenu;
	}

	beforeNavigate(({ from, to }) => {
		if (from?.url.pathname !== to?.url.pathname) {
			showHeaderMenu = false;
		}
	});
</script>

<header class="bg-site-header">
	<nav class="header-nav min-h-20 items-center px-4 py-0">
		<div class="home md:pl-4">
			<a href={page.data.base} class="flex flex-col text-primary no-underline md:flex-row">
				<span class="text-[1.6rem] font-extrabold leading-tight md:text-[2.1rem]"> Libris</span>
				<div
					class="top-0 -rotate-6 self-baseline rounded-sm bg-positive-dark/16 px-2 uppercase text-2-cond-bold md:rotate-0"
					>Beta</div
				>
			</a>
		</div>
		<div class="search pb-4 sm:px-4 sm:pb-0">
			<SuperSearchWrapper placeholder={page.data.t('header.searchPlaceholder')} />
		</div>
		<div class="actions flex min-h-20 items-center justify-end md:pr-4">
			<div id="header-menu" class="hidden items-center lg:flex">
				<HeaderMenu />
			</div>
			<div class="lg:hidden">
				<a
					aria-label={page.data.t('header.openMenu')}
					class="button-ghost h-11 w-11 p-0!"
					href={`${page.url.pathname}?${page.url.search}#header-menu`}
					on:click|preventDefault={toggleHeaderMenu}
				>
					<BiList width={20} height={20} aria-hidden="true" />
				</a>
				{#if showHeaderMenu}
					<Modal close={toggleHeaderMenu}>
						<HeaderMenu />
					</Modal>
				{/if}
			</div>
		</div>
	</nav>
</header>

<style lang="postcss">
	@reference "../../../app.css";

	.header-nav {
		@apply header-layout;
		grid-template-areas:
			'home . actions'
			'search search search';

		@media screen and (min-width: theme('screens.sm')) {
			grid-template-areas: 'home search actions';
		}
	}

	.home {
		grid-area: home;
	}

	.search {
		grid-area: search;
	}

	.actions {
		grid-area: actions;
	}

	#header-menu:target {
		@apply /* TODO: fix better no-JS fallback styling */ absolute left-0 block w-full bg-main;
	}
</style>
