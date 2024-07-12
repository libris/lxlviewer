<script lang="ts">
	import SearchInputWrapper from '$lib/components/SearchInputWrapper.svelte';

	/** Tests to do
	 * - [] text area adjusts height to content automatically when focused
	 * - [] text area with adjusted height should revert to single line when blurred
	 * - [] text area should adjust height to content when window is resized
	 * - [] popover is shown on click or key events other than tab or shift (which is needed for focus management).
	 * - [] pressing enter on the textarea when the popover isn't visible should trigger the popover, otherwise the form should be submitted
	 * - [] pressing escape when the popover is visible should hide it
	 * - [] keep focus on textarea when closing dropdown
	 */

	type SuperSearchProps = {
		value: string;
		placeholder: string;
		ariaLabel: string;
	};

	let { value = $bindable(), placeholder, ariaLabel }: SuperSearchProps = $props();

	let superSearchContainerElement: HTMLDivElement | undefined = $state();
	let dialogElement: HTMLDialogElement | undefined = $state();
	let dropdown = $state(false);
	let prevDropdownValue = $state(false);

	function handleClickTextarea(event: MouseEvent) {
		showDropdown({ selectionStart: (event.target as HTMLTextAreaElement).selectionStart });
	}

	function showDropdown({ selectionStart }: { selectionStart: number }) {
		console.log('selectionStart:', selectionStart);
		if (!dialogElement?.open) {
			dialogElement?.showModal();
			dropdown = true;
		}
	}

	function hideDropdown() {
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

	function handleInput(event: Event) {
		if (!dialogElement?.open) {
			showDropdown({
				selectionStart: (event.target as HTMLTextAreaElement).selectionStart
			});
		}
	}

	function handleTextareaKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey && event.target instanceof HTMLElement) {
			const closestForm = event.target.closest('form');
			if (closestForm) {
				event.preventDefault();
				if (dialogElement?.open) {
					closestForm.submit();
				} else {
					showDropdown({
						selectionStart: (event.target as HTMLTextAreaElement).selectionStart
					});
				}
			}
		}
	}

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

{#snippet searchTextarea({ multiline = false, onclick, disabled = false })}
	<div class="search-resizer" class:multiline data-replicated-value={multiline ? value : undefined}>
		<textarea
			name="_q"
			bind:value
			aria-label={ariaLabel}
			{placeholder}
			autocomplete="off"
			spellcheck="false"
			maxlength={2048}
			rows={1}
			onkeypress={handleTextareaKeyPress}
			oninput={handleInput}
			{onclick}
			{disabled}
			aria-multiline={multiline ? undefined : 'false'}
		></textarea>
	</div>
{/snippet}

<svelte:window onclick={handleWindowClick} />
<div class="super-search" bind:this={superSearchContainerElement}>
	<SearchInputWrapper onclearsearch={clearSearch}
		>{@render searchTextarea({
			onclick: handleClickTextarea,
			disabled: dropdown
		})}</SearchInputWrapper
	>
	<dialog bind:this={dialogElement} onclose={hideDropdown}>
		<div class="dropdown">
			<div class="dropdown-content">
				<SearchInputWrapper onclearsearch={clearSearch}>
					{@render searchTextarea({ multiline: true })}
				</SearchInputWrapper>
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
	.super-search {
		display: contents;
	}

	.search-resizer {
		display: grid;
	}

	.search-resizer :global(textarea),
	.search-resizer:global(::after) {
		border: none;
		background: none;
		padding: 0.875rem 0;
		width: 100%;
		min-height: var(--height-input-lg);
		resize: none;
		font-size: var(--font-size-sm);
	}

	.search-resizer:not(.multiline) :global(textarea) {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.search-resizer.multiline :global(textarea),
	.search-resizer.multiline:global(::after) {
		grid-area: 1 / 1 / 2 / 2;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.search-resizer.multiline::after {
		visibility: hidden;
		content: attr(data-replicated-value) ' ';
		white-space: pre-wrap;
	}

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
