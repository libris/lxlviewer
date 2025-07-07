<script lang="ts">
	import { onDestroy } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { SvelteSet } from 'svelte/reactivity';
	import { page } from '$app/state';
	import IconToC from '~icons/bi/list-ul';

	type Props = {
		items: { id: string; label: string }[];
		uidPrefix?: string;
		mobile?: boolean;
		intersectionRoot?: HTMLElement;
	};

	let { items, uidPrefix, mobile = false, intersectionRoot }: Props = $props();
	let tocElement: HTMLDivElement;
	let observer: IntersectionObserver | undefined = $state();
	let visibleSections: Set<string> = new SvelteSet();
	let firstVisibleSection: string | undefined = $state();
	let openOnMobile = $state(false);

	afterNavigate(() => {
		observer?.disconnect();

		if (!mobile) {
			const closestArticle = tocElement.closest('article');
			if (closestArticle) {
				const sections = Array.from(closestArticle.querySelectorAll<HTMLElement>(':scope [id]'));

				if (sections) {
					observer = new IntersectionObserver(handleObserve, {
						root: intersectionRoot,
						threshold: 0.1 // threashold is requried to ensure correct link is highlighted after clicking on it
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

	function handleObserve(entries: IntersectionObserverEntry[]) {
		entries.forEach((entry) => {
			const id = entry.target.getAttribute('id');
			if (id) {
				if (entry.isIntersecting) {
					visibleSections.add(id);
				} else {
					if (visibleSections.size > 1) visibleSections.delete(id); // always keep atleast one visible section
				}
				if (visibleSections.size) {
					firstVisibleSection =
						tocElement
							.closest('article')
							?.querySelector(`:scope #${Array.from(visibleSections).join(', :scope #')}`) // find first visible section by generating a selector string using the ids of visible secitons
							?.getAttribute('id') || firstVisibleSection; // fallback to previous visible section
				}
			}
		});
	}

	function handleCheckboxKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			tocElement.querySelector<HTMLInputElement>(':scope input[type="checkbox"]')?.click();
		}
	}
</script>

{#snippet tocList()}
	<ul>
		{#each items as { id, label } (id)}
			<li class="border-l-2 border-l-neutral-200">
				<a
					href="{page.url.pathname}#{id}"
					aria-current={id === firstVisibleSection || undefined}
					class="hover:text-body focus:text-body inline-flex min-h-8 items-center px-3 hover:underline focus:underline"
				>
					{label}
				</a>
			</li>
		{/each}
	</ul>
{/snippet}

<div bind:this={tocElement} class="contents">
	{#if mobile}
		<div class="border-b-neutral border-b">
			<label
				id={`${uidPrefix}toc-label`}
				class="bg-page text-2xs text-subtle flex h-11 cursor-pointer items-center gap-1.5 px-3 sm:px-6 has-checked:[&+nav]:block"
			>
				<IconToC class="size-4" />
				{page.data.t('tableOfContents.onThisPage')}
				<input
					type="checkbox"
					role="button"
					bind:checked={openOnMobile}
					aria-expanded={openOnMobile}
					aria-controls={`${uidPrefix}toc-items`}
					aria-haspopup="true"
					class="h-0 appearance-none focus:outline-0"
					onkeydown={handleCheckboxKeydown}
				/>
			</label>
			<nav
				id={`${uidPrefix}toc-items`}
				aria-labelledby={`${uidPrefix}toc-label`}
				class="bg-page text-subtle mb-3 hidden px-3 text-xs sm:px-6"
			>
				{@render tocList()}
			</nav>
		</div>
	{:else}
		<header class="text-subtle mb-2 text-xs font-medium">
			<h2>{page.data.t('tableOfContents.onThisPage')}</h2>
		</header>
		<nav class="text-placeholder text-xs">{@render tocList()}</nav>
	{/if}
</div>

<style lang="postcss">
	/*
		aria-current is styled here as aria-current variant is currently not supported by Tailwind
		(see: https://github.com/tailwindlabs/tailwindcss/discussions/9563 
	*/
	li:has([aria-current]) {
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
