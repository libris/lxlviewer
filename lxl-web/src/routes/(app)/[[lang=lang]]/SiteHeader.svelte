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

<header class="bg-app-header">
	<div
		class="text-2xs/3.5 flex min-h-11 place-content-between items-center gap-8 self-baseline bg-[#fd6b8e] px-3 py-1 font-medium text-[#000] sm:px-6 md:text-xs"
	>
		<span class="flex items-center gap-2">
			<span class="text-2xs rounded-sm bg-[#000] px-1.5 py-0.5 tracking-wide text-[#fff] uppercase">
				Beta
			</span>
			<span>
				{page.data.t('header.betaMessage')}
				<span class="sr-only lg:not-sr-only"> {page.data.t('header.betaDetails')}</span>
			</span>
		</span>
		<a
			href="/"
			class="whitespace-nowrap underline decoration-dotted hover:decoration-solid focus:decoration-solid"
		>
			{page.data.t('header.betaLink')}</a
		>
	</div>
	<nav class="header-nav header-layout min-h-20 items-center py-0">
		<div class="home lg:pl-4">
			<a href={page.data.base} class="flex flex-col no-underline lg:flex-row">
				<span class="font-heading text-2xl font-[600] lg:text-3xl"> Libris</span>
			</a>
		</div>
		<div class="search pb-4 sm:px-4 sm:pb-0">
			<SuperSearchWrapper placeholder={page.data.t('header.searchPlaceholder')} />
		</div>
		<div class="actions flex min-h-20 items-center justify-end lg:pr-4">
			<div
				id="header-menu"
				class="text-3xs hidden items-center target:absolute target:left-0 target:block target:w-full 2xl:flex"
			>
				<HeaderMenu />
			</div>
			<div class="2xl:hidden">
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
