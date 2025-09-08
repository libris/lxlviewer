<script lang="ts">
	import { type SvelteComponent } from 'svelte';
	import { page } from '$app/state';
	import { beforeNavigate } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import HeaderMenu from './HeaderMenu.svelte';
	import SuperSearchWrapper from '$lib/components/supersearch/SuperSearchWrapper.svelte';
	import BiList from '~icons/bi/list';
	import BiSearch from '~icons/bi/search';
	import BetaBanner from '$lib/components/BetaBanner.svelte';

	let showHeaderMenu = $state(false);
	let bannerOffsetHeight: number = $state(0);
	let superSearchWrapperComponent: SvelteComponent | undefined = $state();

	const isFindRoute = $derived(page.route.id === '/(app)/[[lang=lang]]/find');

	function toggleHeaderMenu() {
		showHeaderMenu = !showHeaderMenu;
	}

	beforeNavigate(({ from, to }) => {
		if (from?.url.pathname !== to?.url.pathname) {
			showHeaderMenu = false;
		}
	});

	function onClickExpandSearch() {
		superSearchWrapperComponent?.showExpandedSearch();
	}
</script>

<BetaBanner bind:offsetHeight={bannerOffsetHeight} />
<header
	class={[
		'app-bar bg-app-header top-0 border-b-neutral-200 sm:border-b',
		isFindRoute && 'z-20 sm:sticky'
	]}
>
	<div class="header-nav grid items-center gap-x-8 px-3 sm:min-h-18">
		<div class="home flex sm:pl-3">
			<a href={page.data.localizeHref(page.data.base)} class="grow-0 no-underline">
				<span class="font-heading text-2xl font-[600] lg:text-3xl">Libris</span>
			</a>
		</div>
		<search class="search sm:px-4">
			<SuperSearchWrapper
				placeholder={page.data.t('header.searchPlaceholder')}
				--offset-top={`${bannerOffsetHeight}px`}
				bind:this={superSearchWrapperComponent}
			/>
		</search>
		<div class="actions flex items-center justify-end">
			{#if !isFindRoute}
				<button
					aria-label={page.data.t('search.search')}
					class="text-subtle p-4 sm:hidden"
					onclick={() => onClickExpandSearch()}
				>
					<BiSearch />
				</button>
			{/if}
			<div
				id="header-menu"
				class="text-3xs hidden items-center target:absolute target:left-0 target:block target:w-full lg:pr-3 2xl:flex"
			>
				<HeaderMenu />
			</div>
			<div class="2xl:hidden">
				<a
					aria-label={page.data.t('header.openMenu')}
					class="text-subtle flex items-center p-4"
					href={page.data.localizeHref(`${page.url.pathname}?${page.url.search}#header-menu`)}
					onclick={(e) => {
						e.preventDefault();
						toggleHeaderMenu();
					}}
				>
					<BiList width={20} height={20} aria-hidden="true" />
				</a>
			</div>
		</div>
	</div>
</header>
{#if showHeaderMenu}
	<Modal close={toggleHeaderMenu}>
		<HeaderMenu />
	</Modal>
{/if}

<style lang="postcss">
	@reference 'tailwindcss';

	.app-bar {
		@variant sm {
			height: var(--app-bar-height);
		}
	}

	.header-nav {
		grid-template-areas:
			'home . actions'
			'search search search';

		grid-template-columns: 1fr minmax(0, 8fr) 1fr;

		@variant sm {
			grid-template-areas: 'home search actions';
		}

		@variant lg {
			grid-template-columns: 1fr minmax(0, 4fr) 1fr;
		}

		@variant xl {
			grid-template-columns: 1fr minmax(0, 3fr) 1fr;
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
