<script lang="ts">
	import { page } from '$app/state';
	import { Elem, ShowLabelsOptions } from '$lib/types/decoratedData';
	import type { EodAvailable } from '$lib/types/holdings';
	import type { SearchResultItem } from '$lib/types/search';
	import { BibDb, type DisplayDecorated } from '$lib/types/xl';
	import { getResourceDigitalAccess } from '$lib/utils/getResourceDigitalAccess';
	import DecoratedData2 from '$lib/components/DecoratedData2.svelte';
	import BiLaptop from '~icons/bi/laptop';
	import BiChevronRight from '~icons/bi/chevron-right';

	type Props = {
		overview2: DisplayDecorated[];
		instances: SearchResultItem[];
		eodAvailable: EodAvailable;
		workCard: SearchResultItem;
		isWork: boolean;
	};
	const { overview2, instances, eodAvailable, workCard, isWork }: Props = $props();

	const { online, hasReproduction } = $derived(
		getResourceDigitalAccess(overview2, instances, workCard, isWork)
	);
	const hasDigitalAccess = $derived(online || hasReproduction || eodAvailable);
</script>

{#if hasDigitalAccess}
	<div class="resource-access my-2 flex flex-col gap-3">
		{#if online}
			<div>
				<p class="flex items-center gap-2 font-semibold">
					<BiLaptop class="text-subtle" />
					<span>{page.data.t('search.existsOnline')}:</span>
				</p>
				<DecoratedData2
					data={online}
					showLabels={ShowLabelsOptions.Never}
					block
					limit={{
						associatedMedia: 1,
						isPrimaryTopicOf: 1,
						electronicLocator: 1,
						'marc:versionOfResource': 1
					}}
					parent={Elem.Div}
					skipOuter={true}
				/>
			</div>
		{/if}
		{#if hasReproduction}
			<div>
				<p class="flex items-center gap-2 font-semibold">
					<BiLaptop class="text-subtle" />
					<span>{page.data.t('resource.digitizationAvailable')}:</span>
				</p>
				<DecoratedData2
					data={hasReproduction}
					allowLinks={true}
					showLabels={ShowLabelsOptions.Never}
					block
					limit={{ hasReproduction: 1 }}
					parent={Elem.Div}
					skipOuter={true}
				/>
			</div>
		{:else if eodAvailable}
			<details class="print:hidden">
				<summary class="cursor-pointer">
					<p class="flex items-center gap-1 font-semibold">
						<span class="chevron text-subtle transition-transform">
							<BiChevronRight />
						</span>
						<span>{page.data.t('resource.requestDigitization')}</span>
					</p>
				</summary>
				<div class="my-2 rounded-md border border-neutral-200 p-2">
					<p class="mb-2 text-sm">{page.data.t('resource.digitizationInfo')}.</p>
					<ul>
						{#each eodAvailable as library (library.displayStr)}
							<li>
								<a class="ext-link" target="_blank" href={library[BibDb.eodUri]}
									>{library.displayStr}</a
								>
							</li>
						{/each}
					</ul>
				</div>
			</details>
		{/if}
	</div>
{/if}

<style lang="postcss">
	:global(.resource-access ul) {
		margin-bottom: calc(var(--spacing) * 2);
	}

	details[open] {
		& .chevron {
			transform: rotate(90deg);
		}
	}

	:global(
		.resource-access *[data-type='Instance'],
		.resource-access *[data-type='DigitalResource']
	) {
		display: block;
		width: fit-content;
	}
</style>
