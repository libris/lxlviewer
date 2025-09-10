<script lang="ts">
	import QuerySuggestionIcon from '~icons/fluent/sparkle-16-regular';
	import GoIcon from '~icons/bi/chevron-right';

	import { page } from '$app/state';

	type Props = {
		cellId: string | undefined;
		isFocusedCell: boolean;
	};

	const { cellId, isFocusedCell }: Props = $props();
</script>

<div class="suggestion flex h-14 w-full items-stretch">
	<a href="#" id={cellId} class:focused-cell={isFocusedCell} class=" border-neutral border-b">
		<span
			class="text-subtle order-1 ml-auto hidden items-center rounded-sm px-1.5 py-0.5 text-xs whitespace-nowrap sm:inline-flex"
		>
			<div class="flex flex-col">
				{page.data.t('supersearch.useSearchQuery')}
				<div class="text-3xs ml-auto">(314 träffar)</div>
			</div>
			<span class="ml-6 inline-flex h-10 items-center justify-center">
				<GoIcon class="size-4" />
			</span>
		</span>
		<div class="grid w-full grid-cols-[40px_minmax(0,_1fr)] items-center gap-2">
			<div class="flex aspect-square items-center justify-center rounded-md bg-neutral-100">
				<QuerySuggestionIcon class="text-primary-500 size-7" />
			</div>
			<div>
				<hgroup class="grid gap-1 overflow-hidden text-xs font-medium whitespace-nowrap">
					<h2 class="truncate">LÄGG IN SÖKFÖRSLAG HÄR</h2>
				</hgroup>
			</div>
		</div>
	</a>
</div>

<style lang="postcss">
	@reference "tailwindcss";

	.suggestion :global(.contribution-role) {
		display: none;
	}

	.suggestion:has(:global(*:hover)) h2,
	:global(.focused) > .suggestion h2 {
	}

	:global(:not(.focused)) > .suggestion:has(:global(*:hover)) {
		background-color: var(--color-primary-50);
	}

	.suggestion a {
		display: flex;
		align-items: center;
		text-decoration: none;
	}

	.suggestion a:first-child {
		flex: 1;
		padding: 0 calc(var(--spacing) * 4);
		text-align: left;
	}
</style>
