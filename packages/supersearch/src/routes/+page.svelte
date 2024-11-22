<script lang="ts">
	import SuperSearch from '$lib/components/SuperSearch.svelte';
	import { PUBLIC_ENDPOINT_URL } from '$env/static/public';
	let value1 = $state('');
	let value2 = $state('');
	let placeholder = $state('Search');
</script>

<form action="test1">
	<fieldset data-test-id="test1">
		<legend>Supersearch inside <code>&lt;form&gt;</code> element</legend>
		<SuperSearch
			name="q"
			bind:value={value1}
			{placeholder}
			endpoint={PUBLIC_ENDPOINT_URL}
			queryFunction={(query) =>
				new URLSearchParams({
					_q: query,
					_limit: '10',
					_offset: '0',
					_sort: ''
				})}
			transformerFunction={(data) =>
				data.items.map((item) => ({
					id: item?.['@id'],
					heading: `${item?.hasTitle?.[0]?.mainTitle}`
				}))}
			paginateFunction={(prevSearchParams) => {
				const newSearchParams = new URLSearchParams(Array.from(prevSearchParams.entries()));
				newSearchParams.set(
					'_offset',
					(
						parseInt(prevSearchParams.get('_limit')!, 10) +
						parseInt(prevSearchParams.get('_offset')!, 10)
					).toString()
				);
				return newSearchParams;
			}}
		>
			{#snippet resultItem(item)}
				<button type="button" class="result-item">
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
			endpoint={'/api/find'}
		/>
	</fieldset>
</form>

<form action="test2" id="form-outside"></form>

<label>Placeholder:<input type="text" bind:value={placeholder} /></label>

<style>
	.result-item {
		border: none;
		background: none;
		min-width: 480px;
		min-height: 44px;
		text-align: left;
		& h2 {
			font-weight: inherit;
			font-size: inherit;
		}
	}

	.result-item:not:last-child {
		border-bottom: 1px solid #ccc;
	}
</style>
