<script lang="ts">
	import SuperSearch from '$lib/components/SuperSearch.svelte';
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
				heading: `${item.heading} for ${value1}`
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
		>
			{#snippet resultItem(item)}
				<button type="button" data-test-id="result-item">
					<h2>{item.heading}</h2>
				</button>
			{/snippet}
		</SuperSearch>
	</fieldset>
</form>

<form>
	<fieldset data-test-id="test2">
		<legend>Supersearch using <code>form</code> attribute</legend>
		<SuperSearch
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
		>
			{#snippet resultItem(item)}
				<button type="button" class="result-item" data-test-id="result-item">
					<h2>{item.heading}</h2>
				</button>
			{/snippet}
		</SuperSearch>
	</fieldset>
</form>

<form action="test2" id="form-outside"></form>

<label>Placeholder:<input type="text" bind:value={placeholder} /></label>

<style>
	.result-item {
		min-width: 480px;
		min-height: 44px;
		text-align: left;
		& h2 {
			font-weight: inherit;
			font-size: inherit;
		}
	}
</style>
