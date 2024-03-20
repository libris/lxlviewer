<script lang="ts">
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import InstancesTable from './InstancesTable.svelte';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';
	export let data;
</script>

<div class="product-page">
	<main>
		<header>
			<h1 class="mb-6 text-6-cond-extrabold">
				<DecoratedData data={data.heading} showLabels={ShowLabelsOptions.Never} />
			</h1>
		</header>
		<div class="overview mb-4">
			<DecoratedData data={data.overview} block />
		</div>
		{#if data.instances}
			<div>
				<InstancesTable
					data={data.instances}
					columns={[
						'*[].publication[].*[][?year].year',
						'*[].publication.*[][?agent].agent',
						'"@type"'
					]}
				/>
			</div>
		{/if}
		<details class="json">
			<summary>JSON</summary>
			<details>
				<summary>Heading</summary>
				<pre>{JSON.stringify(data.heading, null, 2)}</pre>
			</details>
			<details>
				<summary>Details</summary>
				<pre>{JSON.stringify(data.details, null, 2)}</pre>
			</details>
			<details>
				<summary>Overview</summary>
				<pre>{JSON.stringify(data.overview, null, 2)}</pre>
			</details>
			<details>
				<summary>Instances</summary>
				<pre>{JSON.stringify(data.instances, null, 2)}</pre>
			</details>
			<details>
				<summary>Full</summary>
				<pre>{JSON.stringify(data.full, null, 2)}</pre>
			</details>
		</details>
	</main>
</div>

<style>
	.product-page {
		display: grid;
		grid-template-columns: 1fr;
		max-width: 1600px;
		margin: 0 auto;
		padding: 2rem;
		gap: 2rem;
	}

	.overview {
		display: grid;
		gap: 2rem;

		& :global(small) {
			display: block;
			&::first-letter {
				text-transform: capitalize;
			}
		}
		& :global(div[data-property]) {
			margin-bottom: 0.8rem;
		}

		& :global([data-property='contribution'] > ._contentBefore),
		:global([data-property='contribution'] > ._contentAfter) {
			display: none;
		}

		& :global([data-property='contribution'] > *) {
			display: block;
			white-space: nowrap;
		}

		& :global([data-property='seeAlso'] > *) {
			display: block;
			white-space: nowrap;
		}
	}

	.json {
		font-size: 0.75rem;
		font-family: monospace;
	}
</style>
