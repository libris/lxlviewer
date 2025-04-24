<svelte:options accessors />

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import IconClose from '~icons/bi/x-lg';
	import { setModalContext } from '$lib/contexts/modal';

	export let dialog: HTMLDialogElement | undefined = undefined;
	export let close: ((event: Event) => void) | undefined = undefined;
	export let position: 'left' | 'right' | 'top' = 'right';

	let prevBodyOverflow: string | undefined = undefined;

	setModalContext();

	onMount(() => {
		dialog?.showModal();
		disableBodyScroll();
	});

	onDestroy(() => {
		if (browser) {
			enableBodyScroll();
		}
	});

	function handleClose(event: MouseEvent | Event) {
		// Use close method from prop if available
		if (close) {
			event.preventDefault();
			close(event);
		} else {
			dialog?.close();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		/** Close dialog if backdrop is clicked */
		if (event.target === event.currentTarget) {
			handleClose(event);
		}
	}

	function disableBodyScroll() {
		prevBodyOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
	}

	function enableBodyScroll() {
		document.body.style.overflow = prevBodyOverflow || '';
	}
</script>

<div
	class="bg-backdrop pointer-events-none fixed top-0 left-0 z-10 h-full w-full"
	transition:fade={{ duration: 300 }}
></div>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
	class="fixed top-0 left-0 flex h-screen max-h-full w-screen max-w-full"
	tabindex="-1"
	on:click|self={handleBackdropClick}
	on:close={handleClose}
	bind:this={dialog}
	data-testid="modal"
	transition:fly={{
		x: position === 'left' ? -12 : 12,
		duration: 250,
		opacity: 0,
		easing: cubicInOut
	}}
>
	<div
		class="bg-page absolute top-0 right-0 flex w-full shadow-2xl md:max-w-[480px] xl:max-w-[640px] {position ===
		'top'
			? 'h-auto'
			: 'h-full'}"
		class:left-0={position === 'left'}
		class:right-0={position === 'right'}
	>
		<div class="flex flex-1 flex-col gap-4 overflow-y-auto pb-4">
			<header
				class="border-neutral sticky top-0 z-10 flex min-h-14 items-center justify-between border-b px-4"
			>
				<h1><slot name="title" /></h1>
				<!-- svelte-ignore a11y-autofocus -->
				<button
					on:click={handleClose}
					autofocus
					aria-label={$page.data.t('general.close')}
					data-testid="close-modal"
				>
					<IconClose />
				</button>
			</header>
			<div class="px-4">
				<slot />
			</div>
		</div>
	</div>
</dialog>

<style>
	dialog {
		background: none;
	}
	::backdrop {
		background: none;
	}
</style>
