<svelte:options accessors />

<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';

	export let dialog: HTMLDialogElement | undefined = undefined;
	export let close: ((event: Event) => void) | undefined = undefined;

	let prevBodyOverflow: string | undefined = undefined;

	onMount(() => {
		disableBodyScroll();
	});

	function handleClose(event: MouseEvent | Event) {
		// Use close method from prop if available
		if (close) {
			event.preventDefault();
			close(event);
		} else {
			dialog?.close();
		}
		enableBodyScroll();
	}

	function handleBackdropClick(event: MouseEvent) {
		/** Close dialog if backdrop is clicked */
		if (event.target === event.currentTarget) {
			dialog?.close();
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

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
	class="fixed left-0 top-0 flex h-screen max-h-full w-screen max-w-full"
	tabindex="-1"
	on:click|self={handleBackdropClick}
	on:close={handleClose}
	bind:this={dialog}
	in:fly={{ x: 24, duration: 300, opacity: 0, easing: cubicInOut }}
>
	<div
		class="absolute right-0 top-0 flex min-h-full w-full flex-col gap-4 bg-main pb-4 md:max-w-[480px]"
	>
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
</dialog>

<style lang="postcss">
	dialog {
		background: none;
	}
	dialog::backdrop {
		background-color: rgb(0 0 0 / 0%);
		transition:
			display 0.7s allow-discrete,
			overlay 0.7s allow-discrete,
			background-color 0.7s;
		padding: 0;
	}

	dialog[open]::backdrop {
		background-color: rgb(0 0 0 / 25%);
	}

	@starting-style {
		dialog[open]::backdrop {
			background-color: rgb(0 0 0 / 0%);
		}
	}
</style>
