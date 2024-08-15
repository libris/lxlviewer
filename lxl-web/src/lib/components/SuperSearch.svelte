<script lang="ts">
	import { tick } from 'svelte';
	import CodeMirror from './CodeMirror.svelte';
	import SearchInputWrapper from '$lib/components/SearchInputWrapper.svelte';
	import sanitizeQSearchParamValue from '$lib/utils/sanitizeQSearchParamValue';
	import { submitClosestFormOnEnter } from '$lib/utils/codemirror';
	import { onDestroy, onMount } from 'svelte';

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
	let collapsedCodeMirror: CodeMirror | undefined = $state();
	let dropdownCodeMirror: CodeMirror | undefined = $state();
	let dialogElement: HTMLDialogElement | undefined = $state();

	let sanitizedValue = $derived(sanitizeQSearchParamValue(value));

	function showDropdown() {
		if (!dialogElement?.open) {
			const selection = collapsedCodeMirror?.getMainSelection();

			if (selection) {
				dropdownCodeMirror?.select(selection);
			}
			dialogElement?.showModal();
		}
	}

	function hideDropdown() {
		const selection = dropdownCodeMirror?.getMainSelection();

		if (selection) {
			collapsedCodeMirror?.select(selection);
		}
		dialogElement?.close();
	}

	function handleClickOutsideDialog(event: MouseEvent) {
		if (event.target === dialogElement) {
			hideDropdown();
		}
	}

	function clearSearch() {
		value = '';
		if (dialogElement?.open) {
			dropdownCodeMirror?.focus();
		} else {
			collapsedCodeMirror?.focus();
		}
	}

	async function showDropdownOnCollapsedChange() {
		await tick(); // await tick to prevent error when selection points outside of document (when typing at the end of the document)
		showDropdown();
	}

	onMount(() => {
		dialogElement?.addEventListener('click', handleClickOutsideDialog);
	});

	onDestroy(() => {
		dialogElement?.removeEventListener('click', handleClickOutsideDialog);
	});
</script>

<div class="super-search" bind:this={superSearchContainerElement}>
	<SearchInputWrapper showClearSearch={!!value} onclearsearch={clearSearch}>
		<div class="collapsed">
			<CodeMirror
				bind:value
				bind:this={collapsedCodeMirror}
				{placeholder}
				extensions={[submitClosestFormOnEnter]}
				onclick={() => showDropdown()}
				onchange={showDropdownOnCollapsedChange}
			/>
		</div>
		<textarea value={sanitizedValue} hidden readonly name="_q" maxlength={2048}></textarea>
	</SearchInputWrapper>
	<dialog bind:this={dialogElement} onclose={hideDropdown}>
		<div class="dropdown">
			<div class="dropdown-content">
				<SearchInputWrapper showClearSearch={!!value} onclearsearch={clearSearch}>
					<CodeMirror
						bind:value
						bind:this={dropdownCodeMirror}
						{placeholder}
						extensions={[submitClosestFormOnEnter]}
					/>
				</SearchInputWrapper>
				<div class="dropdown-actions">
					Bygg och förfina din sökfråga
					<p>Hello</p>
					<p>Hello</p>
					<p>Hello</p>
					<button onclick={() => console.log('Clicked test button')}>Test button</button>
				</div>
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

	.dropdown-actions {
		padding-top: var(--padding-small);
	}

	.collapsed {
		max-height: 48px;
		overflow: hidden;
		white-space: nowrap;
	}
</style>
