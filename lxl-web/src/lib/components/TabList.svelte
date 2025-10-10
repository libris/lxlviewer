<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	export type Tab = {
		label: string;
		id: string;
		content?: Snippet;
		icon?: Component;
	};

	type TabList = {
		ariaLabel: string;
		tabs: Tab[];
	};

	const { tabs, ariaLabel = 'tablist' }: TabList = $props();
	let activeTabIndex = $state(0);

	function handleKeyDown(e: KeyboardEvent) {
		const key = e.key;
		const tabsEl = e.currentTarget as HTMLElement;
		const tabButtons = Array.from(tabsEl.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
		const currentIndex = tabButtons.findIndex((btn) => btn === document.activeElement);

		if (currentIndex === -1) return;

		let newIndex = currentIndex;

		switch (key) {
			case 'ArrowRight':
				newIndex = (currentIndex + 1) % tabButtons.length;
				break;
			case 'ArrowLeft':
				newIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
				break;
			case 'Home':
				newIndex = 0;
				break;
			case 'End':
				newIndex = tabButtons.length - 1;
				break;
			default:
				return;
		}

		e.preventDefault();
		tabButtons[newIndex].focus();
	}
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<div
	class="border-b-neutral flex gap-2 border-b"
	role="tablist"
	aria-label={ariaLabel}
	onkeydown={handleKeyDown}
>
	{#each tabs as tab, i (tab.id)}
		{@const isActive = i === activeTabIndex}
		<div class={['tab-wrapper relative flex h-full items-center', isActive && 'active']}>
			<button
				id={`tab-${tab.id}`}
				class={['tab relative flex gap-2', isActive ? 'tab-highlighted' : 'tab-primary']}
				type="button"
				role="tab"
				aria-selected={isActive}
				aria-controls={`panel-${tab.id}`}
				tabindex={isActive ? 0 : -1}
				onclick={() => (activeTabIndex = i)}
			>
				{#if tab.icon}
					<tab.icon />
				{/if}
				<span>{tab.label} </span>
			</button>
		</div>
	{/each}
</div>
<div class="tab-panels">
	{#each tabs as tab, i (`panel-${tab.id}`)}
		{#if tab.content}
			{@const isActive = i === activeTabIndex}
			<div
				id={`panel-${tab.id}`}
				role="tabpanel"
				aria-labelledby={`tab-${tab.id}`}
				class={[!isActive && 'hidden']}
			>
				{@render tab.content()}
			</div>
		{/if}
	{/each}
</div>

<style lang="postcss">
	@reference 'tailwindcss';

	[role='tablist'] {
		/* --line-position: 6px; */
		height: var(--toolbar-height);

		& .tab-wrapper {
			&::after {
				position: absolute;
				content: '';
				width: 100%;
				height: 3px;
				background-color: transparent;
				left: 0;
				bottom: 0;
				border-radius: var(--radius-lg) var(--radius-lg) 0 0;
			}
			&.active::after {
				background-color: var(--color-accent);
			}
		}
	}
</style>
