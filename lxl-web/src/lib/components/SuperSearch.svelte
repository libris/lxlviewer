<script lang="ts">
	import CodeMirror from './CodeMirror.svelte';
	import SearchInputWrapper from '$lib/components/SearchInputWrapper.svelte';
	import sanitizeQSearchParamValue from '$lib/utils/sanitizeQSearchParamValue';
	import { submitClosestFormOnEnter } from '$lib/utils/codemirror';

	/** Tests to do
	 * - [] text area adjusts height to content automatically when focused
	 * - [] text area with adjusted height should revert to single line when blurred
	 * - [] text area should adjust height to content when window is resized
	 * - [] popover is shown on click or key events other than tab or shift (which is needed for focus management).
	 * - [] pressing enter on the textarea when the popover isn't visible should trigger the popover, otherwise the form should be submitted
	 * - [] pressing escape when the popover is visible should hide it
	 * - [] keep focus on textarea when closing dropdown
	 * - [] retain selection start/end after showing/hiding dropdown
	 * - [] form is only submitted if there is a _q value
	 * - [] max length for search params is enforced
	 */

	type SuperSearchProps = {
		value: string;
		placeholder: string;
	};

	let { value = $bindable(), placeholder }: SuperSearchProps = $props();

	let superSearchContainerElement: HTMLDivElement | undefined = $state();
	let dialogElement: HTMLDialogElement | undefined = $state();
	let dropdown = $state(false);
	let prevDropdownValue = $state(false);

	let cleanedValue = $derived(sanitizeQSearchParamValue(value));

	/*
	function showDropdown({
		selectionStart,
		selectionEnd
	}: {
		selectionStart: number;
		selectionEnd: number;
	}) {
		if (!dialogElement?.open) {
			dialogElement?.showModal();
			dropdown = true;
			const dialogTextareaElement = dialogElement?.querySelector('textarea');
			if (dialogTextareaElement) {
				dialogTextareaElement.selectionStart = selectionStart;
				dialogTextareaElement.selectionEnd = selectionEnd;
			}
		}
	}
	*/

	function hideDropdown() {
		const dialogTextareaElement = dialogElement?.querySelector('textarea');
		const selectionStart = dialogTextareaElement?.selectionStart;
		const selectionEnd = dialogTextareaElement?.selectionEnd;

		const collapsedTextareaElement = superSearchContainerElement?.querySelector('textarea');
		if (collapsedTextareaElement && selectionStart) {
			collapsedTextareaElement.selectionStart = selectionStart;
		}
		if (collapsedTextareaElement && selectionEnd) {
			collapsedTextareaElement.selectionEnd = selectionEnd;
		}

		if (dialogElement?.open) {
			dialogElement.close();
		}
		dropdown = false;
	}

	$effect(() => {
		if (prevDropdownValue !== dropdown) {
			/* Keep focus on textarea when closing dropdown */
			if (!dropdown) {
				superSearchContainerElement?.querySelector('textarea')?.focus();
			}

			prevDropdownValue = dropdown;
		}
	});

	function handleWindowClick(event: MouseEvent) {
		/** Close dialog if click outside */
		if (dialogElement?.open && (event.target as Node).contains(dialogElement)) {
			dialogElement.close();
		}
	}

	function clearSearch() {
		value = '';
		const textareaElement = dropdown
			? superSearchContainerElement?.querySelector('dialog textarea')
			: superSearchContainerElement?.querySelector('textarea');
		if (textareaElement instanceof HTMLTextAreaElement) {
			textareaElement.focus();
		}
	}
</script>

<svelte:window onclick={handleWindowClick} />
<div class="super-search" bind:this={superSearchContainerElement}>
	<SearchInputWrapper showClearSearch={!!value} onclearsearch={clearSearch}>
		<CodeMirror
			bind:value
			{placeholder}
			extensions={[submitClosestFormOnEnter]}
			onfocus={({ selectionStart, selectionEnd }) =>
				console.log('focus', selectionStart, selectionEnd)}
			onblur={({ selectionStart, selectionEnd }) =>
				console.log('blur', selectionStart, selectionEnd)}
		/>
		<textarea value={cleanedValue} hidden readonly name="_q" maxlength={2048}></textarea>
	</SearchInputWrapper>
	<dialog bind:this={dialogElement} onclose={hideDropdown}>
		<div class="dropdown">
			<div class="dropdown-content">
				Bygg och förfina din sökfråga
				<p>Hello</p>
				<p>Hello</p>
				<p>Hello</p>
				<button onclick={() => console.log('ega')}>keke</button>
			</div>
		</div>
	</dialog>
</div>

<style>
	dialog {
		margin: 0;
		border: none;
		background: none;
		padding: 0;
		width: 100%;
		max-width: 100vw;
		height: 100%;
		max-height: 100vh;
	}

	.dropdown {
		/** 
			Dropdown grid should mirror AppHeaders grid layout to ensure correct overlay placement
		*/
		display: grid;
		grid-template-columns: 1fr 4fr 1fr;
		grid-template-areas: '. dropdown-content .';
		padding: 0 calc(var(--gap-base) / 2);
		pointer-events: none;
	}

	.dropdown-content {
		grid-area: dropdown-content;
		box-shadow: 0px 4px 32px 0px rgba(0, 0, 0, 0.15);
		border-radius: var(--border-radius-lg);
		background: var(--background-main);
		padding: var(--padding-small) var(--gap-base);
		pointer-events: auto;
	}
</style>
