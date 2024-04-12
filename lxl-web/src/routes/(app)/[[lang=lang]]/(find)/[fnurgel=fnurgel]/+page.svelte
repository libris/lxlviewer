<script lang="ts">
	import { page } from '$app/stores';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import InstancesList from './InstancesList.svelte';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';
	export let data;
</script>

<article class="resource">
	<div class="content">
		<header>
			<h1 class="mb-6 text-6-cond-extrabold">
				<DecoratedData data={data.heading} showLabels={ShowLabelsOptions.Never} />
			</h1>
		</header>
		<div class="mb-4 flex flex-col-reverse gap-4 md:flex-row">
			<div class="overview flex-1">
				<DecoratedData data={data.overview} block />
			</div>
			{#if data.imageUris.length}
				<div class="flex h-full max-h-72 w-full max-w-72 self-center">
					{#if data.firstImageUri}
						<img
							alt={$page.data.t('general.latestInstanceCover')}
							src={data.firstImageUri}
							class="h-auto w-full object-contain md:object-right"
						/>
					{/if}
				</div>
			{/if}
		</div>
		{#if data.instances?.length}
			<InstancesList
				data={data.instances}
				imageUris={data.imageUris}
				columns={[
					'*[].publication[].*[][?year].year',
					'*[].publication.*[][?agent].agent',
					'"@type"'
				]}
			/>
		{/if}
	</div>
</article>

<style lang="postcss">
	.resource {
		@apply gap-4 p-4;
		display: grid;
		grid-template-areas: 'content';

		@media screen and (min-width: theme('screens.lg')) {
			grid-template-areas: '. content .';
			grid-template-columns: 320px 1fr 320px;
		}
	}

	.content {
		grid-area: content;
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
</style>
