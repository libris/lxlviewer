<script lang="ts">
	import DecoratedData from '$lib/components/DecoratedData.svelte';
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
			<div class="image">Image</div>
			<DecoratedData data={data.overview} block />
		</div>
		<details open>
			<summary class="text-5-cond-extrabold">Details</summary>
			<DecoratedData data={data.details} block />
		</details>
		<div>
			<h2 class="text-5-cond-extrabold">Instances</h2>
			<DecoratedData data={data.instances} />
		</div>
		<details>
			<summary class="text-5-cond-extrabold">JSON</summary>
			Heading
			<pre>{JSON.stringify(data.heading, null, 2)}</pre>
			Overview
			<pre>{JSON.stringify(data.overview, null, 2)}</pre>
			Details
			<pre>{JSON.stringify(data.details, null, 2)}</pre>
		</details>
	</main>
	<aside>Aside</aside>
</div>

<style>
	.product-page {
		display: grid;
		grid-template-columns: 2fr 1fr;
		max-width: 1600px;
		margin: 0 auto;
		padding: 2rem;
		gap: 2rem;
	}

	.overview {
		display: grid;
		grid-template-columns: 1fr 3fr;
		gap: 2rem;

		& :global(strong) {
			display: block;
			&::first-letter {
				text-transform: capitalize;
			}
		}
		& :global(div[data-property]) {
			margin-bottom: 1rem;
		}

		& :global([data-property='contribution'] > ._contentBefore),
		:global([data-property='contribution'] > ._contentAfter) {
			display: none;
		}

		& :global([data-property='contribution'] > *) {
			display: block;
			white-space: nowrap;
		}
	}

	.image {
		background: rgba(0, 0, 0, 0.05);
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 1 / 1;
	}
</style>
