<script lang="ts">
	import { tick, onMount, onDestroy } from 'svelte';
	import CodeMirror, { type ChangeCodeMirrorEvent } from './CodeMirror.svelte';
	import SearchInputWrapper from '$lib/components/SearchInputWrapper.svelte';
	import submitClosestFormOnEnter from '$lib/utils/codemirror/extensions/submitClosestFormOnEnter';
	import debounce from '$lib/utils/debounce';
	import { languageTag } from '$lib/paraglide/runtime.js';
	import type { Qualifiers } from '$lib/types/qualifier';
	import SuggestionListItem, { type QualifierEvent } from './SuggestionListItem.svelte';
	import getEditedParts from '$lib/utils/codemirror/getEditedParts';
	import type { SuggestResponse, Suggestion } from '../../routes/api/[[lang=lang]]/suggest/+server';

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

	let lastValue = $state();
	let fetchedValue: string | undefined = $state();
	let qualifierItems: Suggestion[] = $state([]);
	let workItems: Suggestion[] = $state([]);

	let collapsedCodeMirror: CodeMirror | undefined = $state();
	let dropdownCodeMirror: CodeMirror | undefined = $state();
	let dialogElement: HTMLDialogElement | undefined = $state();

	const findSuggestionItems = debounce(
		async ({ value, cursor }: { value: string; cursor: number }) => {
			/** TODO: add request cancellation if query changes before fetch has finished (or if component is destroyed) */

			try {
				const { wordRange, phraseRange } = getEditedParts({
					value,
					cursor
				});

				const [qualifiersRes, worksRes] = await Promise.all([
					fetch(
						`/api/${languageTag()}/suggest?${new URLSearchParams({
							q: value,
							type: 'qualifier',
							wordRange: `${wordRange.from},${wordRange.to}`,
							...(phraseRange && { phraseRange: `${phraseRange.from},${phraseRange.to}` })
						})}`
					),
					fetch(
						`/api/${languageTag()}/suggest?${new URLSearchParams({
							q: value,
							type: 'work'
						})}`
					)
				]);

				if (!qualifiersRes.ok) {
					throw { status: qualifiersRes.status, statusText: qualifiersRes.statusText };
				}

				if (!worksRes.ok) {
					throw { status: worksRes.status, statusText: worksRes.statusText };
				}

				const qualifiers = (await qualifiersRes.json()) as SuggestResponse;
				const works = (await worksRes.json()) as SuggestResponse;

				qualifierItems = qualifiers.items;
				workItems = works.items;

				fetchedValue = value;
				dropdownCodeMirror?.updateValidatedQualifiers();
			} catch (err) {
				console.error('something went wrong?', err);
			}
		},
		250
	);

	function clearSuggestionItems() {
		qualifierItems = [];
		workItems = [];
		fetchedValue = undefined;
	}

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
		qualifierItems = [];
		workItems = [];
		if (dialogElement?.open) {
			dropdownCodeMirror?.focus();
		} else {
			collapsedCodeMirror?.focus();
		}
	}

	async function handleChangeCodeMirror(event: ChangeCodeMirrorEvent) {
		value = event.value;
		const trimmedValue = value.trim();

		if (trimmedValue !== lastValue) {
			lastValue = trimmedValue;
			if (trimmedValue) {
				findSuggestionItems({ value: trimmedValue, cursor: event.cursor });
			} else {
				clearSuggestionItems();
			}
		}

		if (!dialogElement?.open) {
			await tick(); // await tick to prevent error when selection points outside of document (when typing at the end of the document)
			showDropdown();
		}
	}

	function handleAddQualifier(event: QualifierEvent) {
		console.log('handleAddQualifier', event);
	}

	function handlePreviewQualifierStart(event: QualifierEvent) {
		console.log('handlePreviewQualifierStart', event);
	}

	function handlePreviewQualifierEnd(event: QualifierEvent) {
		console.log('handlePreviewQualifierEnd', event);
	}

	/*
	function handleClickSuggestionItem(suggestion: PartSuggestion) {
		dropdownCodeMirror?.replaceEditedPart(
			`${suggestion.keyByLang?.[languageTag() as keyof typeof suggestion.keyByLang] || suggestion.key}:`
		);
		dropdownCodeMirror?.focus();
	}
	*/

	onMount(() => {
		dialogElement?.addEventListener('click', handleClickOutsideDialog);
	});

	onDestroy(() => {
		dialogElement?.removeEventListener('click', handleClickOutsideDialog);
	});
</script>

<div class="super-search">
	<SearchInputWrapper showClearSearch={!!value} onclearsearch={clearSearch}>
		<div class="collapsed">
			<CodeMirror
				bind:value
				bind:this={collapsedCodeMirror}
				syncedCodeMirrorComponent={dropdownCodeMirror}
				{placeholder}
				{validQualifiers}
				extensions={[submitClosestFormOnEnter]}
				onclick={() => showDropdown()}
				onchange={handleChangeCodeMirror}
			/>
		</div>
		<textarea value={encodeURIComponent(value)} hidden readonly name="_q" maxlength={2048}
		></textarea>
	</SearchInputWrapper>
	<dialog bind:this={dialogElement} onclose={hideDropdown}>
		<div class="dropdown">
			<div class="dropdown-content">
				<div class="dropdown-search">
					<SearchInputWrapper showClearSearch={!!value} onclearsearch={clearSearch}>
						<CodeMirror
							{value}
							bind:this={dropdownCodeMirror}
							syncedCodeMirrorComponent={collapsedCodeMirror}
							follows={true}
							{placeholder}
							{validQualifiers}
							extensions={[submitClosestFormOnEnter]}
						/>
					</SearchInputWrapper>
				</div>
				<nav>
					{#if value && fetchedValue && qualifierItems.length}
						<section class="suggestions">
							<h2 class="dropdown-header">Bygg och förfina din sökfråga</h2>
							<ul>
								{#each qualifierItems as item (item['@id'])}
									<SuggestionListItem
										data={item}
										initialQuery={fetchedValue}
										onaddqualifier={handleAddQualifier}
										onpreviewqualifierstart={handlePreviewQualifierStart}
										onpreviewqualifierend={handlePreviewQualifierEnd}
									/>
								{/each}
							</ul>
							<button class="show-more">Visa fler</button>
						</section>
					{/if}
					{#if value && fetchedValue && workItems.length}
						<section class="suggestions">
							<h2 class="dropdown-header">Sökförslag</h2>
							<ul>
								{#each workItems as item (item['@id'])}
									<SuggestionListItem data={item} initialQuery={fetchedValue} />
								{/each}
							</ul>
							<button class="show-more">Visa fler</button>
						</section>
					{/if}
				</nav>
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
		padding: var(--padding-sm) var(--gap-base) var(--padding-base) var(--padding-base);
	}

	.dropdown :global(section > ul) {
		margin: 0;
	}

	.dropdown-header {
		margin: 0;
		padding: 0 var(--gap-base) var(--padding-2xs) var(--gap-base);
		color: var(--color-super-subtle);
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

	.suggestions {
		padding: var(--padding-base) 0 var(--padding-sm) 0;

		&:first-child {
			padding-top: 0;
		}

		&:not(:first-child) {
			box-shadow: var(--box-shadow-border-top);
		}
	}

	.show-more {
		border: none;
		padding: 0 var(--padding-base);
		color: var(--color-subtle);
		font-size: var(--font-size-xs);
	}
</style>
