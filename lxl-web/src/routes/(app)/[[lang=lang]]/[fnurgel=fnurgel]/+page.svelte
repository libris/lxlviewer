<script lang="ts">
	import { page } from '$app/stores';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import InstancesList from './InstancesList.svelte';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';

	export let data;
</script>

<article class="resource">
	<nav class="shortcuts">
		<div class="shortcuts-content">
			<span class="text-sm font-bold">På denna sida</span>
			<ul class="flex flex-col gap-2">
				<li><a href={$page.url.href} class="text-secondary">Låna</a></li>
				<li><a href={$page.url.href}>Detaljer</a></li>
				<li><a href={$page.url.href}>Utgåvor</a></li>
				<li><a href={$page.url.href}>Liknande verk</a></li>
			</ul>
		</div>
	</nav>
	<div class="content py-4">
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
		display: grid;
		grid-template-areas: 'content';
		position: relative;

		@media screen and (min-width: theme('screens.lg')) {
			grid-template-areas: 'shortcuts content .';
			grid-template-columns: 320px 1fr 320px;
		}
	}

	:global(main:has(> aside)) .resource {
		@media screen and (min-width: theme('screens.lg')) {
			grid-template-areas: 'shortcuts content content';
			grid-template-columns: 320px 1fr 320px;
		}
	}

	.shortcuts {
		display: none;
		grid-area: shortcuts;
		height: calc(100vh - 76px);

		@media screen and (min-width: theme('screens.lg')) {
			display: flex;
			flex-direction: column;
		}

		& a {
			@apply text-secondary;
			margin-bottom: 4px;
		}
	}
	.shortcuts-content {
		position: sticky;
		top: 76px;
		@apply py-4;
	}
	.content {
		grid-area: content;
		width: 100%;
		max-width: 1140px;
		margin: 0 auto;
	}

	.overview {
		display: grid;
		gap: 2rem;
		width: 100%;

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
