<script module lang="ts">
	export type TableOfContentsItem = { id: string; label: string; children?: TableOfContentsItem[] };
</script>

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import IconToC from '~icons/bi/list-ul';
	import { browser } from '$app/env';

	type Props = {
		items: TableOfContentsItem[];
		uidPrefix?: string;
		mobile?: boolean;
		intersectionRoot?: HTMLElement;
	};

	let { items, uidPrefix = '', mobile = false, intersectionRoot }: Props = $props();
	let tocElement: HTMLDivElement;
	let observer: IntersectionObserver | undefined = $state();
	let firstVisibleSection: string | undefined = $state();
	let selectedAnchor: string = $state('');
	let isProgrammaticScroll = $state(false);
	let currentSection = $derived(selectedAnchor || firstVisibleSection || 'top');

	const itemsWithTop = $derived([
		{ id: 'top', label: page.data.t('tableOfContents.top') },
		...items
	]);

	let navbarHeight = $state(0);
	if (browser) {
		const navbar = document.getElementById('appbar');
		navbarHeight = navbar?.getBoundingClientRect().height ?? 0;
	}

	afterNavigate(({ shallow, type }) => {
		if (shallow && type === 'goto') return;

		observer?.disconnect();
		selectedAnchor = window.location.hash?.substring(1);

		if (!mobile) {
			const closestArticle = tocElement?.closest('article');
			if (closestArticle) {
				const sections = itemsWithTop
					.flatMap((item) => [
						document.getElementById(item.id),
						...(item.children?.map((childItem) => document.getElementById(childItem.id)) || [])
					])
					.filter((item) => item !== null);

				if (sections) {
					observer = new IntersectionObserver(handleObserve, {
						root: intersectionRoot,
						rootMargin: `-${navbarHeight}px 0px -80% 0px`,
						threshold: 0
					});
					for (const sectionItem of sections) {
						observer.observe(sectionItem);
					}
				}
			}
		}
	});

	onDestroy(() => {
		observer?.disconnect();
	});

	onMount(() => {
		const handleScroll = () => {
			if (!isProgrammaticScroll) {
				selectedAnchor = '';
			}
		};
		window.addEventListener('scroll', handleScroll);

		const handleHashChange = () => {
			selectedAnchor = window.location.hash?.substring(1);
		};
		window.addEventListener('hashchange', handleHashChange);

		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('hashchange', handleHashChange);
		};
	});

	function handleObserve(entries: IntersectionObserverEntry[]) {
		const visible = entries
			.filter((entry) => entry.isIntersecting)
			.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

		if (visible.length) {
			firstVisibleSection = visible[0].target.id;
		}
	}

	function handleAnchorClick() {
		// this just handles the case where there is no hashchange event:
		// user clicks anchor, scrolls away, clicks same anchor
		selectedAnchor = window.location.hash?.substring(1);
		isProgrammaticScroll = true;
		setTimeout(() => (isProgrammaticScroll = false), 50);
	}
</script>

{#snippet tocList(items: TableOfContentsItem[])}
	<ul>
		{#each items as { id, label, children } (id)}
			<li class={children && '[&>ul_a]:pl-7'}>
				<div class={['border-l-2 border-l-neutral-200']}>
					<a
						href={page.data.localizeHref(`${page.url.pathname}${page.url.search}#${id}`)}
						aria-current={id === currentSection || undefined}
						class={[
							'hover:text-body focus:text-body inline-flex min-h-8 items-center px-3 hover:underline focus:underline'
						]}
						onclick={handleAnchorClick}
					>
						{label}
					</a>
				</div>
				{#if children}
					{@render tocList(children)}
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}

<div bind:this={tocElement} class="contents">
	{#if mobile}
		<details class="border-b-neutral border-b p-1 text-xs sm:text-sm">
			<summary
				id={`${uidPrefix}toc-label`}
				class="bg-page text-subtle flex min-h-8 cursor-pointer items-center gap-1.5 px-2"
			>
				<IconToC class="size-4" />
				<span>{page.data.t('tableOfContents.onThisPage')}</span>
			</summary>
			<nav
				id={`${uidPrefix}toc-items`}
				class="bg-page text-subtle mb-3 px-3 sm:px-6"
				aria-labelledby="toc-heading"
			>
				<p id="toc-heading" class="sr-only">{page.data.t('tableOfContents.onThisPage')}</p>
				{@render tocList(itemsWithTop)}
			</nav>
		</details>
	{:else}
		<nav class="text-placeholder text-xs sm:text-sm" aria-labelledby="toc-heading">
			<header class="text-subtle mb-2 text-xs font-medium sm:text-sm">
				<h2 id="toc-heading">{page.data.t('tableOfContents.onThisPage')}</h2>
			</header>
			{@render tocList(itemsWithTop)}
		</nav>
	{/if}
</div>

<style lang="postcss">
	/*
		aria-current is styled here as aria-current variant is currently not supported by Tailwind
		(see: https://github.com/tailwindlabs/tailwindcss/discussions/9563 
	*/
	li > div:has([aria-current]) {
		border-color: var(--color-accent);
	}
	[aria-current] {
		background: var(--color-accent-50);
		color: var(--color-body);
		font-weight: var(--font-weight-medium);
	}

	label:has(input[type='checkbox']:focus-visible) {
		outline: auto;
	}
</style>
