<script lang="ts">
	import SuperSearch from '$lib/components/SuperSearch.svelte';
	import { lxlQualifierPlugin } from '$lib/index.js';
	import { lxlQuery } from 'codemirror-lang-lxlquery';
	import type { JSONValue } from '$lib/types/json.js';
	import type { MockQueryResponse } from './api/find/+server.js';

	let value1 = $state('');
	let value2 = $state('');
	let placeholder = $state('Search');

	function handlePaginationQuery(searchParams: URLSearchParams, prevData: JSONValue) {
		const paginatedSearchParams = new URLSearchParams(Array.from(searchParams.entries()));
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
				heading: `${item.heading} for "${value1}"`
			}))
		};
	}
</script>

<form action="test1">
	<fieldset data-test-id="test1">
		<legend>Supersearch inside <code>&lt;form&gt;</code> element</legend>
		<SuperSearch
			name="q"
			bind:value={value1}
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
			extensions={[lxlQualifierPlugin()]}
			toggleWithKeyboardShortcut
			comboboxAriaLabel="Search"
		>
			{#snippet resultItem(item, getCellId, isFocusedCell, rowIndex)}
				<div class="result-item" data-test-id="result-item">
					<div role="gridcell">
						<a
							href={`/test1#${getCellId(0)}`}
							id={getCellId(0)}
							class:focused-cell={isFocusedCell(0)}
						>
							<h2>{item.heading}</h2>
						</a>
					</div>
					{#if (rowIndex! > 0 && rowIndex! <= 4) || rowIndex == 9}
						<button
							type="button"
							role="gridcell"
							id={getCellId(1)}
							class:focused-cell={isFocusedCell(1)}>B</button
						>
					{/if}
					{#if (rowIndex! > 0 && rowIndex! < 3) || rowIndex! == 9 || rowIndex! === 4}
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
				Loading...
			{/snippet}
		</SuperSearch>
	</fieldset>
</form>

<form>
	<fieldset data-test-id="test2">
		<legend>Supersearch using <code>form</code> attribute</legend>
		<SuperSearch
			id="supersearch-using-form-attribute"
			name="q"
			bind:value={value2}
			{placeholder}
			form="form-outside"
			endpoint="/api/find"
			queryFn={(query) =>
				new URLSearchParams({
					_q: query,
					_limit: '10'
				})}
			paginationQueryFn={handlePaginationQuery}
			language={lxlQuery}
			extensions={[lxlQualifierPlugin()]}
			comboboxAriaLabel="Search"
			defaultRow={-1}
		>
			{#snippet resultItem(item, getCellId, isFocusedCell, rowIndex)}
				<div class="result-item" data-test-id="result-item" role="gridcell">
					<button type="button" id={getCellId(0)} class:focused-cell={isFocusedCell(0)}>
						<h2>{item.heading} {rowIndex}</h2>
					</button>
				</div>
			{/snippet}
		</SuperSearch>
	</fieldset>
</form>

<form action="test2" id="form-outside"></form>

<label>Placeholder:<input type="text" bind:value={placeholder} /></label>

<style>
	.result-item {
		display: flex;
		align-items: flex-start;
		min-width: 480px;

		& button,
		& [role='gridcell'] {
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
			flex: 1;
		}

		& h2 {
			font-weight: inherit;
			font-size: inherit;
		}
	}

	:global(.lxl-qualifier) {
		background: #ccc;
	}

	:global(.lxl-qualifier-key) {
		background: lightgreen;
	}

	:global(.lxl-qualifier-value) {
		background: lightcyan;
	}

	:global(.lxl-boolean-query, .lxl-wildcard) {
		color: purple;
	}

	:global(button) {
		background: none;
	}
</style>
