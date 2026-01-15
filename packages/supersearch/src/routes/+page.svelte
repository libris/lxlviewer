<script lang="ts">
	import SuperSearch from '$lib/components/SuperSearch.svelte';
	import { lxlQuery } from 'codemirror-lang-lxlquery';
	import type { JSONValue } from '$lib/types/json.js';
	import type { MockQueryResponse } from './api/find/+server.js';
	import clearIconSvg from './icon-clear.svg';
	import backIconSvg from './icon-arrow-left.svg';
	import type { ExpandedContentParams } from '$lib/components/SuperSearch.svelte';
	import { lxlQualifierPlugin } from '$lib/index.js';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import type { QualifierValidationResponse } from '$lib/types/lxlQualifierPlugin.js';

	let isLoading: boolean | undefined = $state();
	let hasData: boolean | undefined = $state();
	let value = $state('');
	let placeholder = $state('Search');
	let useFormAttribute = $state(false);
	let useCustomExpandedContent = $state(false);
	let useWrappingArrowKeyNavigation = $state(false);

	function handlePaginationQuery(searchParams: URLSearchParams, prevData: JSONValue) {
		const paginatedSearchParams = new SvelteURLSearchParams(Array.from(searchParams.entries()));
		const limit = parseInt(searchParams.get('_limit')!, 10);
		const offset = limit + parseInt(searchParams.get('_offset') || '0', 10);
		if (prevData && offset < (prevData as unknown as MockQueryResponse).totalItems) {
			paginatedSearchParams.set('_offset', offset.toString());
			return paginatedSearchParams;
		}
		return undefined;
	}

	function handleTransform(data: JSONValue) {
		const { items, ...rest } = data as unknown as MockQueryResponse;
		return {
			...rest,
			items: items.map((item) => ({
				...item,
				heading: `${item.heading} for "${value}"`
			}))
		};
	}

	function validator(key: string, value?: string): QualifierValidationResponse {
		return {
			key,
			value,
			keyLabel: key,
			invalid: false
		};
	}
</script>

{#snippet expandedContent({
	resultsCount,
	resultsSnippet,
	getCellId,
	isFocusedRow,
	isFocusedCell
}: ExpandedContentParams)}
	<nav>
		<div role="rowgroup">
			{#each { length: 2 }, index}
				{@const rowIndex = index + 1}
				<div
					role="row"
					class="persistent-item"
					class:focused={isFocusedRow(rowIndex)}
					data-testid="persistent-item"
				>
					<button
						type="button"
						role="gridcell"
						id={getCellId(rowIndex, 0)}
						class:focused-cell={isFocusedCell(rowIndex, 0)}
					>
						Persistent item {rowIndex}
					</button>
				</div>
			{/each}
		</div>
		{#if resultsCount}
			<div role="rowgroup">
				{@render resultsSnippet({ rowOffset: 3 })}
			</div>
		{/if}
	</nav>
{/snippet}

<form action="test1">
	<fieldset>
		<legend>Supersearch component</legend>
		<SuperSearch
			name="q"
			bind:value
			bind:isLoading
			bind:hasData
			{placeholder}
			endpoint="/api/find"
			queryFn={(query) =>
				new URLSearchParams({
					_q: query,
					_limit: '10'
				})}
			paginationQueryFn={handlePaginationQuery}
			transformFn={handleTransform}
			language={lxlQuery}
			toggleWithKeyboardShortcut
			defaultInputCol={-1}
			defaultResultRow={0}
			defaultResultCol={0}
			form={useFormAttribute ? 'form-outside' : undefined}
			expandedContent={useCustomExpandedContent ? expandedContent : undefined}
			wrappingArrowKeyNavigation={useWrappingArrowKeyNavigation}
			extensions={[lxlQualifierPlugin(validator, undefined)]}
		>
			{#snippet inputRow({
				expanded,
				inputField,
				getCellId,
				isFocusedCell,
				onclickSubmit,
				onclickClear,
				onclickClose
			})}
				{#if expanded}
					<button
						type="button"
						role="gridcell"
						aria-label="Close"
						class="close-action"
						id={getCellId(0)}
						class:focused-cell={isFocusedCell(0)}
						onclick={onclickClose}
					>
						<img src={backIconSvg} width={16} height={16} alt="" />
					</button>
				{/if}
				<div class="supersearch-input">
					{@render inputField()}
				</div>
				{#if value}
					<button
						type="reset"
						role="gridcell"
						aria-label="Clear"
						class="clear-action"
						id={getCellId(1)}
						class:focused-cell={isFocusedCell(1)}
						onclick={onclickClear}
					>
						<img src={clearIconSvg} width={16} height={16} alt="" />
					</button>
				{/if}
				<button
					type="submit"
					role="gridcell"
					class="submit-action"
					enterkeyhint="search"
					id={getCellId(2)}
					class:focused-cell={isFocusedCell(2)}
					onclick={onclickSubmit}
				>
					Search
				</button>
			{/snippet}
			{#snippet resultItemRow({ resultItem, getCellId, isFocusedCell, rowIndex })}
				<div class="result-item" data-testid="result-item">
					<div role="gridcell">
						<a
							href={`/test1#${getCellId(0)}`}
							id={getCellId(0)}
							class:focused-cell={isFocusedCell(0)}
						>
							<h2>{resultItem.heading}</h2>
						</a>
					</div>
					{#if (rowIndex! > 1 && rowIndex! <= 5) || rowIndex == 10}
						<button
							type="button"
							role="gridcell"
							id={getCellId(1)}
							class:focused-cell={isFocusedCell(1)}>B</button
						>
					{/if}
					{#if (rowIndex! > 1 && rowIndex! < 4) || rowIndex! == 10 || rowIndex! === 5}
						<button
							type="button"
							role="gridcell"
							id={getCellId(2)}
							class:focused-cell={isFocusedCell(2)}
						>
							C
						</button>
					{/if}
				</div>
			{/snippet}
			{#snippet loadingIndicator()}
				<div data-testid="loading-indicator">Loading...</div>
			{/snippet}
		</SuperSearch>
		<div data-testid="is-loading-bind">
			is loading: {isLoading}
		</div>
		<div data-testid="has-data-bind">
			has data: {hasData}
		</div>
		<div>
			value: <span data-testid="supersearch-input-value">{value}</span>
		</div>
	</fieldset>
</form>

<form action="test2" id="form-outside"></form>

<fieldset>
	<legend>Options</legend>
	<label>Placeholder:<input type="text" bind:value={placeholder} /></label>
	<label
		><input type="checkbox" bind:checked={useFormAttribute} data-testid="use-form-attribute" />
		Use form attribute
	</label>
	<label
		><input
			type="checkbox"
			bind:checked={useCustomExpandedContent}
			data-testid="use-custom-expanded-content"
		/>
		Use custom expanded content
	</label>
	<label
		><input
			type="checkbox"
			bind:checked={useWrappingArrowKeyNavigation}
			data-testid="use-wrapping-arrow-key-navigation"
		/>
		Use wrapping arrow key navigation
	</label>
</fieldset>

<style>
	:global(.supersearch-input) {
		& :global(.cm-content) {
			padding: 0;
		}
		& :global(.cm-line) {
			min-height: 44px;
			line-height: 44px;
		}

		& :global(.cm-focused) {
			outline: none;
		}
	}

	:global(.supersearch-dialog) {
		width: 100%;
		max-width: 640px;
	}

	.submit-action,
	.close-action,
	.clear-action {
		cursor: pointer;
		min-width: 44px;
		height: 44px;
	}

	:global(.supersearch-dialog) {
		& :global(a:not(.focused-cell):hover),
		& :global(button:not(.focused-cell):hover) {
			background: #ddffdd;
		}
	}

	:global(.supersearch-dialog .focused) {
		background: #ebebeb;
	}

	:global(.supersearch-dialog) {
		& :global(.focused-cell) {
			background: lightgreen;
		}
	}

	:global(.cm-content[aria-haspopup='dialog']) {
		background: url(./icon-search.svg) 16px center no-repeat;
		padding-left: 44px;
	}

	.persistent-item,
	.result-item {
		display: flex;
		align-items: flex-start;
		min-width: 480px;

		& button,
		& [role='gridcell'] {
			cursor: pointer;
			min-width: 44px;
			min-height: 44px;
		}

		& [role='gridcell']:first-child {
			flex: 1;

			& a {
				justify-content: flex-start;
			}
		}

		& a {
			display: flex;
			justify-content: center;
			align-items: center;
			min-width: 44px;
			min-height: 44px;
		}

		& button:first-child {
			display: flex;
			flex: 1;
			align-items: center;
		}

		& h2 {
			font-weight: inherit;
			font-size: inherit;
		}
	}

	:global(.lxl-qualifier) {
		background: lightcyan;
	}

	:global(.lxl-ghost-group) {
		display: inline-block;
		background: cyan;
		width: 5px;
		height: 5px;
	}

	:global(.lxl-boolean-query, .lxl-wildcard) {
		color: purple;
	}

	:global(button) {
		background: none;
	}

	.supersearch-input {
		display: flex;
		flex: 1;
		overflow: hidden;

		& :global(.codemirror-container) {
			display: block;
			flex: 1;
			overflow: hidden;
		}
	}

	.close-action {
		@media screen and (min-width: 640px) {
			display: none;
		}
	}

	:global(.supersearch-dialog-wrapper) {
		height: 100vh;
	}
</style>
