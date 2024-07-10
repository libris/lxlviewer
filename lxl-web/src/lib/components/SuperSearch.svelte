<script lang="ts">
	/** Tests to do
	 * - [] text area adjusts height to content automatically when focused
	 * - [] text area with adjusted height should revert to single line when blurred
	 * - [] text area should adjust height to content when window is resized
	 * - [] popover is shown on click or key events other than tab or shift (which is needed for focus management).
	 * - [] pressing enter on the textarea when the popover isn't visible should trigger the popover, otherwise the form should be submitted
	 * - [] pressing escape when the popover is visible should hide it
	 */

	type SuperSearchProps = {
		value: string;
		placeholder: string;
		ariaLabel: string;
		container: HTMLElement;
	};

	let { value = $bindable(), placeholder, ariaLabel, container }: SuperSearchProps = $props();
	let activeElement: Element | undefined = $state();
	let mirrorElement: HTMLTextAreaElement;
	let textareaHeight: number | undefined = $state();
	let focusedTextarea: boolean = $state(false);
	let showPopover: boolean = $state(false);

	function handleClickTextarea() {
		showPopover = true;
	}

	function handleTextareaKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey && event.target instanceof HTMLElement) {
			const closestForm = event.target.closest('form');
			if (closestForm) {
				event.preventDefault();
				if (showPopover) {
					closestForm.submit();
				} else {
					showPopover = true;
				}
			}
		}
	}

	function handleTextareaKeyUp(event: KeyboardEvent) {
		/** Use keyup event as keypress doesn't support arrow key events */
		if (event.key !== 'Tab' && event.key !== 'Shift' && event.key !== 'Escape') {
			showPopover = true;
		}

		if (event.key === 'Escape') {
			showPopover = false;
		}
	}

	function handleTextareaFocus(
		event: Event & { currentTarget: EventTarget & HTMLTextAreaElement }
	) {
		focusedTextarea = true;
		mirrorElement.textContent = (event.currentTarget as HTMLTextAreaElement).value; // uses textContent instead of assigning value as an attribute to ensure right order of events
		calculateTextareaHeight(); // calculate textarea height to account for window resizes while unfocused
	}

	function handleTextareaInput(
		event: Event & { currentTarget: EventTarget & HTMLTextAreaElement }
	) {
		mirrorElement.textContent = (event.currentTarget as HTMLTextAreaElement).value;
		calculateTextareaHeight();
	}

	function handleTextareaBlur() {
		focusedTextarea = false;
	}

	function handleWindowResize() {
		if (focusedTextarea) {
			calculateTextareaHeight();
		}
	}

	function handleClickDocument(event: MouseEvent & { target: EventTarget | null }) {
		if (event.target && !container.contains(event.target as Node)) {
			showPopover = false;
		}
	}

	function calculateTextareaHeight() {
		textareaHeight = mirrorElement.scrollHeight;
	}

	/*
	let focusedSuperSearch = $derived(container?.contains(activeElement as Node));

	$effect(() => {
		if (!focusedSuperSearch) {
			showPopover = false;
		}
	});
	*/
</script>

<svelte:window onresize={handleWindowResize} />
<svelte:document bind:activeElement onclick={handleClickDocument} />
<section class="super-search">
	<div class="search-input">
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
			onclick={handleClickTextarea}
			onkeyup={handleTextareaKeyUp}
			oninput={handleTextareaInput}
			onfocus={handleTextareaFocus}
			onblur={handleTextareaBlur}
			style={focusedTextarea && textareaHeight && textareaHeight > 50
				? `height:${textareaHeight}px`
				: 'white-space:nowrap;'}
		></textarea>
		<textarea class="mirror" bind:this={mirrorElement} readonly></textarea>
	</div>
	{#if showPopover}
		<div class="popover" style="padding-top:{textareaHeight}px">
			Bygg och förfina din sökfråga
			<p>Hello</p>
			<p>Hello</p>
			<p>Hello</p>
			<button onclick={() => console.log('ega')}>keke</button>
		</div>
	{/if}
</section>

<style>
	.super-search {
		position: relative;
	}
	.search-input {
		position: relative;
		z-index: 10;
		min-height: var(--height-input-lg);
	}

	textarea {
		position: absolute;
		padding-top: 0.875rem;
		padding-bottom: 0.875rem;
		resize: none;
		&:not(.mirror) {
			max-height: 75vh;
			overflow-y: auto;
		}
	}

	textarea.mirror {
		visibility: hidden;
		height: var(--height-input-lg);
		overflow: auto;
		-ms-overflow-style: none;
		scrollbar-width: none;
		&::-webkit-scrollbar {
			display: none;
		}
	}

	.popover {
		position: absolute;
		top: 0;
		box-shadow: 0px 4px 32px 0px rgba(0, 0, 0, 0.15);
		border-radius: var(--border-radius-lg);
		background: var(--background-main);
		padding: var(--padding-base);
		width: 100%;
	}
</style>
