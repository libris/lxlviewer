<script lang="ts">
	/** Tests to do
	 * - [] text area adjusts height to content automatically when focused
	 * - [] text area with adjusted height should revert to single line when blurred
	 * - [] text area should adjust height to content when window is resized
	 */

	type SuperSearchProps = {
		value: string;
		placeholder: string;
		ariaLabel: string;
	};

	let { value = $bindable(), placeholder, ariaLabel }: SuperSearchProps = $props();
	let mirrorElement: HTMLTextAreaElement;
	let textareaHeight: number | undefined = $state();
	let textareaFocused: boolean = $state(false);

	function handleTextareaKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey && event.target instanceof HTMLElement) {
			const closestForm = event.target.closest('form');
			if (closestForm) {
				event.preventDefault();
				closestForm.submit();
			}
		}
	}

	function handleTextareaFocus() {
		textareaFocused = true;
		calculateTextareaHeight(); // calculate textarea height to account for window resizes while unfocused
	}

	function handleTextareaInput(
		event: Event & { currentTarget: EventTarget & HTMLTextAreaElement }
	) {
		mirrorElement.textContent = (event.currentTarget as HTMLTextAreaElement).value; // uses textContent instead of assigning value as an attribute to ensure right order of events
		calculateTextareaHeight();
	}

	function handleTextareaBlur() {
		textareaFocused = false;
	}

	function handleWindowResize() {
		if (textareaFocused) {
			calculateTextareaHeight();
		}
	}

	function calculateTextareaHeight() {
		textareaHeight = mirrorElement.scrollHeight;
	}
</script>

<svelte:window onresize={handleWindowResize} />
<div class="super-search">
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
		oninput={handleTextareaInput}
		onfocus={handleTextareaFocus}
		onblur={handleTextareaBlur}
		style={textareaFocused && textareaHeight ? `height:${textareaHeight}px` : 'white-space:nowrap;'}
	></textarea>
	<textarea class="mirror" bind:this={mirrorElement}></textarea>
</div>

<style>
	.super-search {
		position: relative;
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
</style>
