<script lang="ts">
	import { page } from '$app/state';

	import TableOfContents from './TableOfContents.svelte';
	import DecoratedData from './DecoratedData.svelte';
	import ResourceImage from './ResourceImage.svelte';
	import { type SecureImage, Width as ImageWidth } from '$lib/types/auxd';
	import getTypeIcon from '$lib/utils/getTypeIcon';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';

	type Props = {
		uid?: string;
		type?: string;
		images: SecureImage[];
	};

	const { uid, type, images }: Props = $props();

	const uidPrefix = $derived(uid ? `${uid}-` : ''); // used for prefixing id's when resource is rendered inside panes

	const tocItems = $derived([
		{
			id: `${uidPrefix}top`,
			label: page.data.t('tableOfContents.top')
		},
		{
			id: `${uidPrefix}occurrences`,
			label: page.data.t('resource.occurrences')
		},
		{
			id: `${uidPrefix}third`,
			label: 'Label'
		},
		{
			id: `${uidPrefix}fourth`,
			label: 'Label'
		}
	]);

	let TypeIcon = $derived(type ? getTypeIcon(type) : undefined);
</script>

{#snippet scrollableSection(id: string)}
	<section {id} class="-mx-3 sm:-mx-6 @3xl:mx-0">
		<h2>{id === 'occurrences' ? page.data.t('resource.occurrences') : id}</h2>
		<ul
			class="scrollbar-hidden flex gap-3 overflow-x-auto overscroll-x-contain px-3 sm:px-6 @3xl:px-0"
		>
			{#each { length: 10 }}
				<li class="min-w-[192px] flex-1 text-sm">
					<div class="aspect-2/3 bg-neutral-100"></div>
					Lorem ipsum ad est dolors
				</li>
			{/each}
		</ul>
	</section>
{/snippet}

<article class="@container [&_[id]]:scroll-mt-3 sm:[&_[id]]:scroll-mt-6">
	<section data-testid="toc-mobile" class="contents @7xl:hidden">
		<TableOfContents items={tocItems} {uidPrefix} mobile />
	</section>
	<div
		class="max-w-10xl wide:max-w-screen mx-auto flex flex-col gap-3 p-3 sm:gap-6 sm:p-6 @3xl:grid @3xl:grid-cols-(--two-grid-cols) @7xl:grid-cols-(--three-grid-cols)"
	>
		<div class="order-last hidden @7xl:block">
			<section data-testid="toc" class="sticky top-6">
				<TableOfContents items={tocItems} />
			</section>
		</div>
		<div>
			<div class="sticky top-6">
				<ResourceImage
					{images}
					{type}
					alt={page.data.t('general.latestInstanceCover')}
					thumbnailTargetWidth={ImageWidth.MEDIUM}
					linkToFull
				/>
			</div>
		</div>
		<div class="wide:max-w-screen mx-auto flex w-full max-w-4xl flex-col gap-3 sm:gap-6">
			<section id="{uidPrefix}top">
				<header>
					<hgroup>
						<p class="text-subtle text-xs font-medium">
							{#if TypeIcon}
								<TypeIcon class="mr-0.5 inline text-sm" />
							{/if}
							<DecoratedData data={page.data.types} showLabels={ShowLabelsOptions.Never} />
						</p>
						<h1 class="decorated-heading my-3 text-3xl font-medium @3xl:text-3xl">
							<DecoratedData data={page.data.heading} showLabels={ShowLabelsOptions.Never} />
						</h1>
					</hgroup>
				</header>
				<div class="decorated-overview">
					<DecoratedData data={page.data.overview} block />
				</div>
			</section>
			{@render scrollableSection(`${uidPrefix}occurrences`)}
			{@render scrollableSection(`${uidPrefix}third`)}
			{@render scrollableSection(`${uidPrefix}fourth`)}
		</div>
	</div>
</article>

<style lang="postcss">
	@reference 'tailwindcss';

	.decorated-heading {
		& :global(.transliteration) {
			font-size: var(--text-2xl);
			color: var(--color-subtle);
		}

		& :global(.agent-lifespan) {
			font-weight: var(--font-weight-normal);
			color: var(--color-subtle);
		}
	}

	.decorated-overview {
		& :global(.property-label) {
			font-size: var(--text-2xs);
		}

		& :global(.contribution-role) {
			font-size: var(--text-2xs);
			color: var(--color-subtle);
		}

		& :global(small) {
			display: block;
			&::first-letter {
				text-transform: capitalize;
			}
		}
		& :global(div[data-property]:not(:last-child)) {
			margin-bottom: calc(var(--spacing) * 1.5);

			@variant sm {
				margin-bottom: calc(var(--spacing) * 3);
			}
		}

		& :global(.contribution > ._contentBefore),
		:global(.contribution > ._contentAfter) {
			display: none;
		}

		& :global(.contribution > *) {
			display: block;
		}

		& :global(.see-also > *) {
			display: block;
			width: fit-content;
			white-space: nowrap;
		}
	}
</style>
