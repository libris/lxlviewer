<script lang="ts">
	import { tick, onMount, onDestroy } from 'svelte';
	import CodeMirror, { type EditedRange, type ChangeCodeMirrorEvent } from './CodeMirror.svelte';
	import SearchInputWrapper from '$lib/components/SearchInputWrapper.svelte';
	import sanitizeQSearchParamValue from '$lib/utils/sanitizeQSearchParamValue';
	import submitClosestFormOnEnter from '$lib/utils/codemirror/extensions/submitClosestFormOnEnter';
	import getSuggestionTypeLabel from '$lib/utils/supersearch/getSuggestionsTypeLabel';
	import debounce from '$lib/utils/debounce';
	import { languageTag } from '$lib/paraglide/runtime.js';
	import type { PartSuggestion } from '$lib/types/suggestions';
	import type { AutocompleteResponse } from '$lib/types/autocomplete';
	import type { Qualifiers } from '$lib/types/qualifier';

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
		validQualifiers: Qualifiers;
	};

	let { value = $bindable(), placeholder, validQualifiers }: SuperSearchProps = $props(); // should we keep codemirror instances in sync using update listeners instead of binding to ensure history is kept as is (but will it work with when removing linebreaks?)? See: https://codemirror.net/examples/split/

	let editedRange: EditedRange | null | undefined = $state();
	// let autocompletionItems: [] = $state([]);

	let partSuggestions: [] = $state([]);

	let superSearchContainerElement: HTMLDivElement | undefined = $state();
	let collapsedCodeMirror: CodeMirror | undefined = $state();
	let dropdownCodeMirror: CodeMirror | undefined = $state();
	let dialogElement: HTMLDialogElement | undefined = $state();

	let sanitizedValue = $derived(sanitizeQSearchParamValue(value));

	const findQueryPartSuggestions = debounce(async (editedRange: EditedRange) => {
		if (editedRange) {
			/** TODO: add request cancellation if query changes before fetch has finished */

			try {
				const autocompleteRes = await fetch(
					`/api/${languageTag()}/autocomplete?_q=${encodeURIComponent(sanitizedValue)}&editedRange=${editedRange.from},${editedRange.to}`
				);

				const autocompletions = (await autocompleteRes.json()) as AutocompleteResponse;

				dropdownCodeMirror?.updateValidatedQualifiers();

				console.log('autocompletions', autocompletions);
				// autocompletionItems = autocompletions;
			} catch (error) {
				console.error('something went wrong?', error);
			}
		} else {
			partSuggestions = [];
		}
	}, 250);

	function showDropdown() {
		if (!dialogElement?.open) {
			const selection = collapsedCodeMirror?.getMainSelection();

			if (selection) {
				dropdownCodeMirror?.select(selection);
			}
			dialogElement?.showModal();
			dropdownCodeMirror?.focus(); // manually focus to circumvent issue with Chrome focusing wrong element
		}
	}

	function hideDropdown() {
		value = sanitizedValue; // should this be here?
		const selection = dropdownCodeMirror?.getMainSelection(); // TODO: normalize selection if value differs from sanitizedValue (e.g. selection on multiple rows should convert nicely to selection on a single row)

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
		editedRange = undefined;
		partSuggestions = [];
		if (dialogElement?.open) {
			dropdownCodeMirror?.focus();
		} else {
			collapsedCodeMirror?.focus();
		}
	}

	async function handleChangeCodeMirror(event: ChangeCodeMirrorEvent) {
		editedRange = event.editedRange;
		findQueryPartSuggestions(editedRange);
		if (!dialogElement?.open) {
			await tick(); // await tick to prevent error when selection points outside of document (when typing at the end of the document)
			showDropdown();
		}
	}

	function handleClickSuggestionItem(suggestion: PartSuggestion) {
		dropdownCodeMirror?.replaceEditedPart(
			`${suggestion.keyByLang?.[languageTag() as keyof typeof suggestion.keyByLang] || suggestion.key}:`
		);
		dropdownCodeMirror?.focus();
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
				{validQualifiers}
				extensions={[submitClosestFormOnEnter]}
				onclick={() => showDropdown()}
				onchange={handleChangeCodeMirror}
			/>
		</div>
		<textarea value={sanitizedValue} hidden readonly name="_q" maxlength={2048}></textarea>
	</SearchInputWrapper>
	<dialog bind:this={dialogElement} onclose={hideDropdown}>
		<div class="dropdown">
			<div class="dropdown-content">
				<div class="dropdown-search">
					<SearchInputWrapper showClearSearch={!!value} onclearsearch={clearSearch}>
						<CodeMirror
							bind:value
							bind:this={dropdownCodeMirror}
							{placeholder}
							{validQualifiers}
							extensions={[submitClosestFormOnEnter]}
							onchange={handleChangeCodeMirror}
						/>
					</SearchInputWrapper>
				</div>
				{#if partSuggestions?.length}
					<section>
						<h2 class="dropdown-header">Bygg och förfina din sökfråga</h2>
						<ul>
							{#each partSuggestions as suggestion}
								<li class="suggestion-item">
									<button onclick={() => handleClickSuggestionItem(suggestion)}>
										<span class="suggestion-label"
											>{suggestion?.labelByLang?.[languageTag()] || suggestion?.key}</span
										>
										{#if suggestion?.['@id']}
											<span class="suggestion-id">— {suggestion?.['@id']}</span>
										{/if}
									</button>
									<ul class="suggestion-actions">
										<li>
											Lägg till + {getSuggestionTypeLabel(suggestion, languageTag()).toLowerCase()}
										</li>
									</ul>
								</li>
							{/each}
						</ul>
					</section>
				{/if}
				<footer class="dropdown-footer">
					<a href="/">Visa fler träffar</a>
					<a href="/">Hjälp</a>
				</footer>
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
		grid-template-columns: 1fr minmax(0, 4fr) 1fr;
		grid-template-areas: '. dropdown-content .';
		padding: 0 calc(var(--gap-base) / 2);
		pointer-events: none;
	}

	.dropdown-content {
		grid-area: dropdown-content;
		box-shadow: 0px 4px 32px 0px rgba(0, 0, 0, 0.15);
		border-radius: var(--border-radius-lg);
		background: var(--background-main);
		padding: 0;
		pointer-events: auto;
	}

	.dropdown-search {
		padding: var(--padding-sm) var(--gap-base);
	}

	.dropdown :global(section > ul) {
		margin: 0;
	}

	.dropdown-header {
		margin: 0;
		padding: 0 var(--gap-base) var(--padding-2xs) var(--gap-base);
		color: var(--color-subtle);
		font-weight: 500;
		font-size: var(--font-size-sm);
	}

	.dropdown-footer {
		display: flex;
		justify-content: space-between;
		box-shadow: var(--box-shadow-border-top);
		padding: var(--padding-sm) var(--gap-base);
		min-height: var(--height-input-xs);
		font-size: var(--font-size-sm);
	}

	.dropdown-footer :global(a) {
		color: var(--color-link);
		text-decoration: none;

		&:hover {
			text-decoration: underline;
		}
	}

	.collapsed {
		max-height: 48px;
	}
	.collapsed :global(.cm-line) {
		white-space: nowrap;
	}

	.collapsed :global(.cm-scroller) {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	.collapsed :global(.cm-scroller::-webkit-scrollbar) {
		display: none;
	}

	.suggestion-item {
		display: flex;
		gap: var(--gap-2xs);
		padding: 0 var(--gap-base);
		width: 100%;
		font-size: var(--font-size-sm);

		&::before {
			display: none;
		}

		&:hover,
		&:focus-within {
			background: rgb(234, 242, 237, 0.5);
		}
	}

	.suggestion-item > :global(button) {
		display: flex;
		flex: 1;
		align-items: center;
		gap: var(--gap-sm);
		cursor: pointer;
		border: none;
		padding: 0;
		min-height: var(--height-input-sm);
	}

	.suggestion-id {
		color: var(--color-super-subtle);
		font-style: italic;
		font-size: var(--font-size-2xs);
	}

	.suggestion-label {
		border-radius: 4px;
		background: rgba(14, 113, 128, 0.1);
		padding: 2px 4px;
		color: #0e7180;
		font-weight: 500;
	}

	.suggestion-label:first-letter {
		text-transform: uppercase;
	}

	.suggestion-actions {
		display: flex;
		align-items: center;
		margin-left: auto;
		color: var(--color-subtle);
		font-size: var(--font-size-xs);
	}
</style>
