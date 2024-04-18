<svelte:options accessors />

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { browser } from '$app/environment';

	export let dialog: HTMLDialogElement | undefined = undefined;
	export let close: ((event: Event) => void) | undefined = undefined;

	let prevBodyOverflow: string | undefined = undefined;

	onMount(() => {
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
	class="pointer-events-none fixed left-0 top-0 h-full w-full bg-backdrop"
	transition:fade={{ duration: 300 }}
></div>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
	class="fixed left-0 top-0 flex h-screen max-h-full w-screen max-w-full"
	tabindex="-1"
	on:click|self={handleBackdropClick}
	on:close={handleClose}
	bind:this={dialog}
	transition:fly={{ x: 12, duration: 250, opacity: 0, easing: cubicInOut }}
>
	<div class="absolute right-0 top-0 flex h-full w-full gap-4 bg-main md:max-w-[480px]">
		<div class="flex flex-1 flex-col gap-4 overflow-y-auto pb-4">
			<header
				class="sticky top-0 flex min-h-14 items-center justify-end border-b border-b-primary/8 bg-main py-2 pl-4 pr-2"
			>
				<!-- svelte-ignore a11y-autofocus -->
				<button on:click={handleClose} autofocus class="flex h-11 w-11 items-center justify-center">
					X
				</button>
			</header>
			<slot />
		</div>
	</div>
</dialog>

<style lang="postcss">
	dialog {
		background: none;
	}
	::backdrop {
		background: none;
	}
</style>
