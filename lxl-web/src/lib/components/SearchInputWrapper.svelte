<script lang="ts">
	import type { Snippet } from 'svelte';
	import IconSearch from '~icons/bi/search';
	import IconClear from '~icons/bi/x-lg';
	import * as m from '$lib/paraglide/messages.js';

	type SearchInputWrapperProps = {
		children: Snippet;
		onclickwrapper?: (event: MouseEvent) => void;
		onclearsearch: (event: MouseEvent) => void;
		showClearSearch: boolean;
	};
	let {
		children,
		showClearSearch = false,
		onclickwrapper,
		onclearsearch
	}: SearchInputWrapperProps = $props();

	function handleClickWrapper(event: MouseEvent) {
		const inputElement = (event.target as HTMLElement)?.querySelector('textarea, input');
		if (inputElement instanceof HTMLTextAreaElement || inputElement instanceof HTMLInputElement) {
			inputElement.focus();
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="search-input-wrapper" onclick={onclickwrapper || handleClickWrapper}>
	<div class="search-icon">
		<IconSearch />
	</div>
	<div class="search-input">
		{@render children()}
	</div>
	{#if showClearSearch}
		<button type="button" class="clear-action" aria-label={m.clearSearch()} onclick={onclearsearch}>
			<IconClear />
		</button>
	{/if}
</div>

<style>
	.search-input-wrapper {
		position: relative;
		cursor: text;
		box-shadow: var(--box-shadow-border-all);
		border: none;
		border-radius: 8px;
		background: #fff;
		padding: 0 var(--height-input-base);
		width: 100%;
		min-height: var(--height-input-lg);
	}

	.search-input {
		display: contents;
	}

	.search-input :global(input) {
		border: none;
		background: none;
		padding: 0.875rem 1px;
		width: 100%;
		height: 100%;
		min-height: var(--height-input-lg);
		overflow: hidden;
		font-size: var(--font-size-sm);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.search-input-wrapper:has(.search-input *:focus) {
		outline: auto;
	}

	.search-input-wrapper :global(input:first-of-type),
	.search-input-wrapper :global(textarea:first-of-type) {
		outline: none;
	}

	.search-icon {
		display: flex;
		position: absolute;
		left: 0;
		justify-content: center;
		align-items: center;
		z-index: 100;
		width: var(--height-input-base);
		height: var(--height-input-lg);
		pointer-events: none;
		color: var(--color-subtle);
	}

	.clear-action {
		display: flex;
		position: absolute;
		top: 0;
		right: 0;
		justify-content: center;
		align-items: center;
		z-index: 100;
		cursor: pointer;
		border: none;
		width: var(--height-input-base);
		height: var(--height-input-lg);
		color: var(--color-subtle);

		&:hover,
		&:focus {
			color: var(--color-base);
		}
	}
</style>
