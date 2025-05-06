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

<header class="bg-app-header border-b-primary-200 border-b">
	<nav class="header-nav header-layout min-h-20 items-center py-0">
		<div class="home md:pl-4">
			<a href={page.data.base} class="flex flex-col no-underline md:flex-row">
				<span class="text-2xl font-[600] md:text-3xl"> Libris</span>
				<div
					class="bg-primary-200 top-0 -rotate-6 self-baseline rounded-sm px-2 text-sm uppercase md:rotate-0"
				>
					Beta
				</div>
			</a>
		</div>
		<div class="search pb-4 sm:px-4 sm:pb-0">
			<SuperSearchWrapper placeholder={page.data.t('header.searchPlaceholder')} />
		</div>
		<div class="actions flex min-h-20 items-center justify-end md:pr-4">
			<div
				id="header-menu"
				class="text-3xs hidden items-center target:absolute target:left-0 target:block target:w-full lg:flex"
			>
				<HeaderMenu />
			</div>
			<div class="lg:hidden">
				<a
					aria-label={page.data.t('header.openMenu')}
					class="text-subtle flex items-center p-4"
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
		grid-template-areas:
			'home . actions'
			'search search search';

		@variant sm {
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
</style>
