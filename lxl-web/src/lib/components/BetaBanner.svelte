<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	type Props = {
		offsetHeight?: number | undefined;
	};

	let { offsetHeight = $bindable() }: Props = $props();

	let bannerElement: HTMLDivElement | undefined = $state();
	let observer: IntersectionObserver | undefined = $state();

	onMount(() => {
		if (browser && bannerElement) {
			observer = new IntersectionObserver(handleObserve);
			observer.observe(bannerElement);
		}
	});

	onDestroy(() => {
		observer?.disconnect();
	});

	function handleObserve(entries: IntersectionObserverEntry[]) {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				offsetHeight = entry.target.scrollHeight;
			} else {
				offsetHeight = 0;
			}
		});
	}
</script>

<div
	aria-label="beta banner"
	class="beta-banner text-2xs/3.5 bg-warning-300 flex min-h-11 place-content-between items-center gap-3 px-3 py-1 font-medium sm:px-6 md:text-xs"
	bind:this={bannerElement}
>
	<span class="flex flex-1 items-center gap-2">
		<span
			class="text-3xs sm:text-2xs rounded-sm bg-black px-1.5 py-0.5 tracking-wide text-white uppercase"
		>
			Beta
		</span>
		<span class="sm:hidden">
			{page.data.t('banner.messageMobile')}
		</span>
		<span class="hidden sm:inline">
			{page.data.t('banner.messageDesktop')}
		</span>
	</span>
	<a
		href={page.data.localizeHref?.('/about')}
		class="link-subtle hidden whitespace-nowrap sm:inline"
	>
		{page.data.t('banner.feedback')}
	</a>
	<a href="https://libris.kb.se" class="link-subtle whitespace-nowrap">
		{page.data.t('banner.old')}
	</a>
</div>
