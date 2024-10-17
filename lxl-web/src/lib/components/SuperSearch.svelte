<script lang="ts">
	import { page } from '$app/stores';
	import { tick, onMount, onDestroy } from 'svelte';
	import CodeMirror, { type ChangeCodeMirrorEvent } from './CodeMirror.svelte';
	import SearchInputWrapper from '$lib/components/SearchInputWrapper.svelte';
	import findOnEnter from '$lib/utils/codemirror/extensions/findOnEnter';
	import debounce from '$lib/utils/debounce';
	import { languageTag } from '$lib/paraglide/runtime.js';
	import SuggestionListItem, { type QualifierEvent } from './SuggestionListItem.svelte';
	import getEditedParts from '$lib/utils/codemirror/getEditedParts';
	import type { SuggestResponse, Suggestion } from '../../routes/api/[[lang=lang]]/suggest/+server';
	import { afterNavigate, goto, replaceState } from '$app/navigation';
	import preventNewLine from '$lib/utils/codemirror/extensions/preventNewLine';
	import { EditorView } from '@codemirror/view';
	import preventInsertBeforeQualifier from '$lib/utils/codemirror/extensions/preventInsertBeforeQualifier';
	import preventArrowDownKey from '$lib/utils/codemirror/extensions/preventArrowDownKey';
	import { createQualifierWidgets } from '$lib/utils/codemirror/extensions/qualifierWidgets';

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

	let cursor: number = $state(value.length);
	let lastValue = $state();
	let fetchedValue: string | undefined = $state();
	let qualifierItems: Suggestion[] = $state([]);
	let workItems: Suggestion[] = $state([]);

	let collapsedCodeMirror: CodeMirror | undefined = $state();
	let expandedCodeMirror: CodeMirror | undefined = $state();
	let dialogElement: HTMLDialogElement | undefined = $state();
	let selectionBeforeClose: { anchor: number; head: number } | undefined = $state();
	let selectionBeforeNavigation: { anchor: number; head?: number } | undefined = $state();

	const editiedParts = $derived(getEditedParts({ value, cursor }));

	const findSuggestionItems = debounce(
		async ({ value, cursor }: { value: string; cursor: number }) => {
			fetchedValue = undefined;
			/** TODO: add request cancellation if query changes before fetch has finished (or if component is destroyed) */

			try {
				const { wordRange, phraseRange, qualifierType, qualifierValue } = getEditedParts({
					value,
					cursor
				});

				if (qualifierType && !qualifierValue) {
					return;
				}

				const [qualifiersRes, worksRes] = await Promise.all([
					fetch(
						`/api/${languageTag()}/suggest?${new URLSearchParams({
							q: value,
							type: 'qualifier',
							wordRange: `${wordRange.from},${wordRange.to}`,
							...(phraseRange && { phraseRange: `${phraseRange.from},${phraseRange.to}` }),
							...(qualifierType && { qualifierType }),
							...(qualifierValue && { qualifierValue })
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

				if (qualifiersRes.ok) {
					const qualifiers = (await qualifiersRes.json()) as SuggestResponse;
					qualifierItems = qualifiers.items;
				}

				if (worksRes.ok) {
					const works = (await worksRes.json()) as SuggestResponse;
					workItems = works.items;
				}

				fetchedValue = value;
				expandedCodeMirror?.updateValidatedQualifiers();
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

	function showExpandedSearch(options: { selectEnd?: boolean } = {}) {
		if (!dialogElement?.open) {
			if (options.selectEnd) {
				expandedCodeMirror?.selectEnd();
			} else {
				const selection = collapsedCodeMirror?.getMainSelection();
				if (selection) {
					expandedCodeMirror?.select(selection);
				}
			}

			dialogElement?.showModal();
			expandedCodeMirror?.focus(); // manually focus to circumvent issue with Chrome focusing wrong element
		}
	}

	function hideExpandedSearch() {
		selectionBeforeClose = expandedCodeMirror?.getMainSelection();
		dialogElement?.close();
	}

	function handleOnCloseDialog() {
		if (selectionBeforeClose) {
			collapsedCodeMirror?.select(selectionBeforeClose);
			selectionBeforeClose = undefined;
		} else {
			collapsedCodeMirror?.select(expandedCodeMirror?.getMainSelection());
		}
		collapsedCodeMirror?.focus();
	}

	function handleClickOutsideDialog(event: MouseEvent) {
		if (event.target === dialogElement) {
			hideExpandedSearch();
		}
	}

	function clearSearch() {
		if ($page.url.pathname === '/find') {
			const newUrl = new URL($page.url);
			newUrl.searchParams.set('_q', '');
			replaceState(newUrl, $page.state);
		}
		resetEditors({ doc: '' });
		value = '';
		clearSuggestionItems();
		if (dialogElement?.open) {
			expandedCodeMirror?.focus();
		} else {
			collapsedCodeMirror?.focus();
		}
	}

	async function handleChangeCodeMirror(event: ChangeCodeMirrorEvent) {
		value = event.value;
		cursor = event.cursor;
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
			showExpandedSearch();
		}
	}

	function handleAddQualifier(
		event: QualifierEvent,
		options: { updateUrl: boolean } = { updateUrl: true }
	) {
		clearSuggestionItems();
		if (options.updateUrl) {
			selectionBeforeNavigation = { anchor: event.change.from + event.change.insert.length };
			goto(event.href);
		} else {
			collapsedCodeMirror?.dispatchChange(event.change);
			expandedCodeMirror?.dispatchChange(event.change);
			expandedCodeMirror?.focus();
		}
	}

	function handlePreviewQualifierStart() {
		// console.log('handlePreviewQualifierStart', event);
	}

	function handlePreviewQualifierEnd() {
		// console.log('handlePreviewQualifierEnd', event);
	}

	function handleKeyDown(event: KeyboardEvent) {
		/** Handle keyboard navigation in dialog */
		if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
			const focusableElements = Array.from(
				(event.target as HTMLElement)
					.closest('dialog')
					?.querySelectorAll(
						`.cm-content, .suggestions ${document.activeElement?.classList?.contains('alt-action') ? '.alt-action' : '.main-action'}, .suggestions button`
					) || []
			);

			const index = document.activeElement
				? focusableElements?.indexOf(document.activeElement)
				: -1;

			if (index > -1) {
				(
					focusableElements[event.key === 'ArrowUp' ? index - 1 : index + 1] as HTMLElement
				)?.focus();
			}
		} else if (
			event.key === 'ArrowLeft' &&
			document.activeElement?.classList?.contains('alt-action')
		) {
			(document.activeElement.previousElementSibling as HTMLElement)?.focus();
		} else if (
			event.key === 'ArrowRight' &&
			document.activeElement?.classList?.contains('main-action')
		) {
			(document.activeElement.nextElementSibling as HTMLElement)?.focus();
		}
	}

	function resetEditors({
		doc,
		selection
	}: {
		doc: string;
		selection?: { anchor: number; head?: number };
	}) {
		collapsedCodeMirror?.reset({ doc, selection });
		expandedCodeMirror?.reset({ doc, selection });
	}

	onMount(() => {
		dialogElement?.addEventListener('click', handleClickOutsideDialog);
	});

	onDestroy(() => {
		dialogElement?.removeEventListener('click', handleClickOutsideDialog);
	});

	afterNavigate(({ to, type }) => {
		if (type !== 'enter') {
			const valueFromSearchParams = to?.url.searchParams.get('_q') || '';
			if (selectionBeforeNavigation) {
				cursor = selectionBeforeNavigation?.anchor;
			}
			resetEditors({
				doc: valueFromSearchParams,
				selection: selectionBeforeNavigation
			});
			selectionBeforeNavigation = undefined;
			hideExpandedSearch();
			value = valueFromSearchParams; // ensures textarea is updated after navigation
		}
	});

	const qualifierWidgets = $derived(
		createQualifierWidgets($page.data?.qualifiers?.qualifiersByPrefixedValue || {})
	);

	function handleAddQualiferType(type: string) {
		const currentSelection = collapsedCodeMirror.getMainSelection();
		collapsedCodeMirror.dispatchChange(
			{ from: currentSelection.anchor, to: currentSelection.head, insert: `${type}:` },
			{ userEvent: 'input' }
		);

		hideExpandedSearch();
		collapsedCodeMirror?.focus();
	}
</script>

<div class="super-search">
	<SearchInputWrapper
		showClearSearch={!!value}
		onclickwrapper={() => showExpandedSearch({ selectEnd: true })}
		onclearsearch={clearSearch}
	>
		<div class="collapsed">
			<CodeMirror
				bind:value
				bind:this={collapsedCodeMirror}
				syncedCodeMirrorComponent={expandedCodeMirror}
				{placeholder}
				extensions={[
					findOnEnter,
					preventNewLine,
					preventInsertBeforeQualifier,
					preventArrowDownKey,
					qualifierWidgets
				]}
				onclick={() => showExpandedSearch()}
				onchange={handleChangeCodeMirror}
			/>
		</div>
		<textarea {value} hidden readonly name="_q" maxlength={2048}></textarea>
	</SearchInputWrapper>
	<dialog bind:this={dialogElement} onclose={handleOnCloseDialog}>
		<div class="dropdown" role="presentation" onkeydown={handleKeyDown}>
			<div class="dropdown-content">
				<div class="dropdown-search">
					<SearchInputWrapper
						showClearSearch={!!value}
						onclickwrapper={expandedCodeMirror?.focus}
						onclearsearch={clearSearch}
					>
						<CodeMirror
							{value}
							bind:this={expandedCodeMirror}
							syncedCodeMirrorComponent={collapsedCodeMirror}
							follows={true}
							{placeholder}
							extensions={[
								findOnEnter,
								EditorView.lineWrapping,
								preventNewLine,
								preventInsertBeforeQualifier,
								preventArrowDownKey,
								qualifierWidgets
							]}
						/>
					</SearchInputWrapper>
				</div>
				<nav>
					{#if editiedParts.word}
						{#if qualifierItems.length}
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
						{#if workItems.length}
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
					{:else}
						<section>
							<ul>
								<h2 class="dropdown-header">Välj kategori att söka inom</h2>
								<li>
									<button type="button" onclick={() => handleAddQualiferType('titel')}
										>Titel: <span>boktitel, filmtitel, etc.</span></button
									>
								</li>
								<li>
									<button type="button" onclick={() => handleAddQualiferType('person')}
										>Person: <span>författare, kompositör, etc.</span></button
									>
								</li>
								<li>
									<button type="button" onclick={() => handleAddQualiferType('subject')}
										>Ämne: <span>plats, period, person, etc.</span></button
									>
								</li>
								<li>
									<button type="button" onclick={() => handleAddQualiferType('SPRÅK')}
										>Språk: <span>svenska, engelska, etc.</span></button
									>
								</li>
							</ul>
						</section>
					{/if}
				</nav>
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
		overflow: hidden;
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
		padding: 0 var(--gap-base) var(--padding-xs) var(--gap-base);
		color: var(--color-subtle);
		font-weight: 500;
		font-size: var(--font-size-xs);
	}

	.collapsed {
		max-height: 48px;
	}

	.collapsed :global(.cm-scroller) {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	.collapsed :global(.cm-scroller::-webkit-scrollbar) {
		display: none;
	}

	.suggestions {
		padding: var(--padding-base) 0 0 0;

		&:first-child {
			padding-top: 0;
		}

		&:not(:first-child) {
			box-shadow: var(--box-shadow-border-top);
		}
	}

	.suggestions button {
		display: flex;
		align-items: center;
		cursor: pointer;
		width: 100%;
		min-height: var(--height-input-sm);

		&:focus,
		&:hover {
			background: #f3f3f3;
		}
	}

	.show-more {
		border: none;
		padding: 0 var(--padding-base);
		color: var(--color-link);
		font-size: var(--font-size-xs);
	}
</style>
