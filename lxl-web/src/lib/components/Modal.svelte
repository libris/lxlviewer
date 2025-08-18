<svelte:options />

<script lang="ts">
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { page } from '$app/state';
	import IconClose from '~icons/bi/x-lg';
	import { setModalContext } from '$lib/contexts/modal';

	interface Props {
		dialog?: HTMLDialogElement | undefined;
		close?: ((event: Event) => void) | undefined;
		position?: 'left' | 'right' | 'top';
		title?: Snippet;
		children?: Snippet;
	}

	let {
		dialog = $bindable(undefined),
		close = undefined,
		position = 'right',
		title,
		children
	}: Props = $props();

	setModalContext();

	onMount(() => {
		dialog?.showModal();
	});

	onDestroy(() => {});

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

	export { dialog, close, position };
</script>

<div
	class="bg-backdrop pointer-events-none fixed top-0 left-0 z-20 h-full w-full"
	transition:fade={{ duration: 300 }}
></div>
<dialog
	class="fixed top-0 left-0 flex h-screen max-h-full w-screen max-w-full"
	tabindex="-1"
	onclick={handleBackdropClick}
	onclose={handleClose}
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
		class="3xl:max-w-[640px] absolute top-0 right-0 flex w-full bg-neutral-50 shadow-2xl lg:max-w-[480px] {position ===
		'top'
			? 'h-auto'
			: 'h-full'}"
		class:left-0={position === 'left'}
		class:right-0={position === 'right'}
	>
		<div
			class="flex flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto overscroll-contain pb-4"
		>
			<header
				class="border-neutral sticky top-0 z-10 flex min-h-14 items-center justify-between border-b bg-neutral-50 px-4"
			>
				<h1 class="font-heading">
					{@render title?.()}
				</h1>
				<!-- svelte-ignore a11y_autofocus -->
				<button
					onclick={handleClose}
					autofocus
					aria-label={page.data.t('general.close')}
					data-testid="close-modal"
				>
					<IconClose class="text-subtle" />
				</button>
			</header>
			<div class="px-4">
				{@render children?.()}
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
