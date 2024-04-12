<script lang="ts">
	import { setContext } from 'svelte';

	import { writable } from 'svelte/store';

	import { page } from '$app/stores';
	import { afterNavigate, replaceState } from '$app/navigation';
	import SiteHeader from './SiteHeader.svelte';
	import '../../../app.css';
	export let data;

	let aside = $page.url.searchParams.get('aside') || null;
	let asideData = writable();

	setContext('asideData', asideData);

	afterNavigate(({ to }) => {
		if (to?.url.searchParams.has('aside')) {
			aside = to?.url.searchParams.get('aside');
		}
	});

	function getCloseAsideLink(url: URL) {
		const newSearchParams = new URLSearchParams([...Array.from(url.searchParams.entries())]);
		newSearchParams.delete('aside');
		return `${url.origin}${url.pathname}${newSearchParams.size ? '?' + newSearchParams.toString() : ''}`;
	}

	function handleCloseAside(
		event: MouseEvent & { currentTarget: HTMLAnchorElement },
		url: URL,
		state: object
	) {
		event.preventDefault();
		aside = null;
		replaceState(getCloseAsideLink(url), state);
	}
</script>

<svelte:head>
	<title>Libris</title>
	<base href={data.base} />
</svelte:head>
<div class="page" class:with-aside={aside}>
	<SiteHeader />
	<main>
		<div class="main-content px-4">
			<slot />
		</div>
		{#if $page.url.pathname !== '/' && aside}
			<aside>
				<div class="aside-content">
					<header class="aside-header">
						Bestånd
						<a
							href={getCloseAsideLink($page.url)}
							on:click={(event) => handleCloseAside(event, $page.url, $page.state)}
							class="text-sm"
						>
							Close X
						</a>
					</header>
					<ul class="flex flex-col gap-4 p-4 text-sm">
						{#if $asideData?.length}
							<table class="table-fixed">
								{#each $asideData as asideItem}
									<tr class="min-h-8">
										<td class="font-bold">
											{asideItem?.heldBy?.name}
										</td>
										<td class="text-secondary"
											>{asideItem?.heldBy?.sigel ? `(${asideItem?.heldBy?.sigel})` : ''}</td
										>
										<td>{asideItem?.shelfMark?.label}</td>
									</tr>
								{/each}
							</table>
						{/if}
					</ul>
				</div>
			</aside>
		{/if}
	</main>
</div>
<div id="floating-elements-container" />

<style lang="postcss">
	.page {
		display: flex;
		flex-direction: column;

		/*
		& .main-content {
			height: calc(100vh - 76px);
			overflow-y: auto;
		}
		*/
	}
	.page.with-aside {
		& main {
			grid-template-columns: 1fr 320px;
		}
	}

	main {
		display: grid;
	}

	aside {
		position: relative;
		background: rgb(var(--bg-pill) / 0.04);
	}

	.aside-content {
		top: 76px;
		height: calc(100vh - 76px);
		overflow-x: hidden;
		overflow-y: auto;
		position: sticky;
		scrollbar-color: inherit rgb(var(--bg-main) / 1);
	}

	.aside-header {
		@apply p-4;
		position: sticky;
		background: #f0eee9;
		top: 0;
		display: flex;
		justify-content: space-between;
	}
</style>
