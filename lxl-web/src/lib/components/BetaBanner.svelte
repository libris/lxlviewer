<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import IconFeedback from '~icons/bi/chat-dots';
	import IconGoto from '~icons/bi/chevron-right';

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
	class="beta-banner bg-warning-300 flex min-h-9 place-content-between items-center gap-1.5 px-3 py-1 font-medium"
	bind:this={bannerElement}
>
	<span class="flex flex-1 items-center gap-1.5">
		<span class="text-3xs rounded-sm bg-black px-1 py-0.5 text-white uppercase">Beta</span>
		<span class="text-xs/3">
			<span class="lg:hidden">
				{page.data.t('banner.messageMobile')}
			</span>
			<span class="hidden lg:inline">
				{page.data.t('banner.messageDesktop')}
			</span>
		</span>
	</span>
	<span class="flex gap-1.5 text-xs whitespace-nowrap sm:gap-3">
		<a href={page.data.localizeHref?.('/about')} class="link-subtle hidden items-center sm:flex">
			<IconFeedback class="mr-1 size-3" />
			{page.data.t('banner.feedback')}
		</a>
		<a href="https://libris.kb.se" class="link-subtle hidden items-center sm:flex">
			<IconGoto class="mr-0.75 size-3" />
			{page.data.t('banner.old')}
		</a>
	</span>
</div>
