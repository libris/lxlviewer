<script lang="ts">
	import QuerySuggestionIcon from '~icons/fluent/sparkle-16-regular';
	// import QuerySuggestionIcon from '~icons/hugeicons/ai-search-02';
	import GoIcon from '~icons/bi/chevron-right';
	import QualifierPill from '$lib/components/supersearch/QualifierPill.svelte';
	import { page } from '$app/state';

	type Props = {
		query: string;
		cellId: string | undefined;
		isFocusedCell: boolean;
	};

	const { query, cellId, isFocusedCell }: Props = $props();
</script>

<div class="suggestion flex h-14 w-full items-stretch">
	<a
		href={`find?_q=${query}`}
		id={cellId}
		class:focused-cell={isFocusedCell}
		class=" border-neutral border-b"
	>
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
		<div class="query grid w-full grid-cols-[40px_minmax(0,_1fr)] items-center gap-2">
			<div class="flex aspect-square items-center justify-center">
				<QuerySuggestionIcon class=" text-accent-300 size-7" />
			</div>
			<div class="scrollbar-hidden flex gap-1 overflow-x-scroll">
				<div
					class="inline-flex items-center text-xs [&>*]:min-h-7 [&>*]:items-center [&>span]:inline-flex [&>span]:whitespace-nowrap"
				>
					<QualifierPill
						key="contributor"
						keyLabel="Författare/upphov"
						operator=":"
						value={query}
						valueLabel={'August Strindberg, 1849-1912'}
					/>
				</div>

				<!--
				<div
					class="inline-flex items-center text-xs [&>*]:min-h-7 [&>*]:items-center [&>span]:inline-flex [&>span]:whitespace-nowrap"
				>
					<QualifierPill
						key="contributor"
						keyLabel="Författare/upphov"
						operator=":"
						value={query}
						valueLabel={'August Strindberg, 1849-1912'}
					/>
				</div>
				-->
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

	.query {
		position: relative;

		/*
		&::after {
			content: '';
			position: absolute;
			height: 100%;
			width: 12px;
			background: linear-gradient(90deg, var(--color-neutral-50) 100%, rgba(0, 0, 0, 0) 0%);
			right: 0;
		}
		*/
	}
</style>
