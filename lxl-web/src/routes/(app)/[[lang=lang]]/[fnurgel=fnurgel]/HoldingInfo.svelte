<script lang="ts">
	import { page } from '$app/state';
	import { type HoldingStatus } from '$lib/types/api';
	import type { BibIdObj, DecoratedHolder, ItemLinksByBibId } from '$lib/types/holdings';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import BiChevronRight from '~icons/bi/chevron-right';
	import { BibDb } from '$lib/types/xl';

	type HoldingInfoProps = {
		holder: DecoratedHolder;
		holdingUrl: string;
		linksByBibId: ItemLinksByBibId;
	};

	const { holder, holdingUrl, linksByBibId }: HoldingInfoProps = $props();

	const sigel = holder?.sigel;
	let loading = $state(false);
	let statusData: HoldingStatus[] | undefined = $state();
	let error: string | undefined = $state();

	// if holdingUrl is an instance fnurgel, add its mapped bibId object into arr,
	// else add all ids of current type with holdings for current sigel
	const bibIds = $derived.by(() => {
		return page.data.bibIdsByInstanceId?.[holdingUrl]
			? [page.data.bibIdsByInstanceId[holdingUrl]]
			: Object.keys(page.data.bibIdsByInstanceId)
					.filter((i) => page.data.bibIdsByInstanceId[i]['@type'] === holdingUrl)
					.filter((i) => page.data.bibIdsByInstanceId[i].holders?.includes(sigel))
					.map((i) => page.data.bibIdsByInstanceId[i]);
	});

	async function fetchHoldingStatus(ids: BibIdObj[]) {
		const promises = ids.map((id) => {
			if (id) {
				const searchParams = new URLSearchParams();
				searchParams.set('bib_id', id.bibId);
				searchParams.set('sigel', sigel);
				if (id.onr) {
					searchParams.set('onr', id.onr);
				}
				id.isbn.forEach((i: string) => {
					searchParams.set('isbn', i);
				});
				id.issn.forEach((i: string) => {
					searchParams.set('issn', i);
				});
				return fetch(`/api/holdingstatus?${searchParams.toString()}`);
			}
		});

		const responses = await Promise.all(promises);
		const data = await Promise.all(
			responses.map((response) => {
				if (response && response.ok) {
					return response.json();
				} else {
					error = `${page.data.t('holdings.loanStatusFailed')}: ${response?.status} ${response?.statusText}`;
				}
			})
		);
		return data;
	}

	async function getHoldingStatus() {
		if (!sigel || !bibIds || bibIds.length < 1) {
			error = page.data.t('holdings.loanStatusFailed');
		} else if (!statusData) {
			loading = true;

			fetchHoldingStatus(bibIds)
				.then((data) => {
					statusData = data;
					loading = false;
				})
				.catch((err) => {
					error = `${page.data.t('holdings.loanStatusFailed')}: ${err}`;
					loading = false;
				});
		}
	}

	function getIndicator(status: string) {
		if (status && typeof status === 'string') {
			switch (status.toLowerCase()) {
				case 'tillgänglig':
				case 'ej utlånad':
				case 'available':
					return 'available';
				case 'ej tillgänglig':
				case 'utlånad':
				case 'on loan':
				case 'not available':
					return 'unavailable';
				default:
					return false;
			}
		}
		return false;
	}

	function urlNotDefinedError(err: string | undefined) {
		if (
			err &&
			err === `URL till lånestatus för ${sigel} ej definierad i LIBRIS biblioteksdatabas!`
		) {
			return true;
		}
		return false;
	}

	function hasLinksToItem(id: string) {
		return linksByBibId[id]?.[holder.sigel]?.[BibDb.LinksToItem];
	}

	function hasLoanReserveLink(id: string) {
		return linksByBibId[id]?.[holder.sigel]?.[BibDb.LoanReserveLink];
	}

	function missingAtLeastOneLinkToItem() {
		return bibIds.find((id) => !hasLinksToItem(id.bibId) && !hasLoanReserveLink(id.bibId));
	}
</script>

<li class="border-neutral text-xs not-last:border-b">
	<div class="my-3">
		<span class="holder-label">
			<DecoratedData data={holder.obj} showLabels={ShowLabelsOptions['Never']} />
		</span>
		<ul>
			{#each bibIds as id (id.bibId)}
				{#if linksByBibId[id.bibId]?.[holder.sigel]}
					<div class="my-1">
						{#if hasLoanReserveLink(id.bibId)}
							<li>
								<div class="instance-token mt-2 mb-1">{id.str}</div>
								<a
									href={linksByBibId[id.bibId][holder.sigel]['loanReserveLink'].at(0)}
									target="_blank"
									class="btn btn-outlined ext-link h-9"
								>
									{page.data.t('holdings.loanReserveLink')}
								</a>
							</li>
						{:else if hasLinksToItem(id.bibId)}
							<li>
								<div class="instance-token mt-2 mb-1">{id.str}</div>
								<a
									href={linksByBibId[id.bibId][holder.sigel][BibDb.LinksToItem].at(0)}
									target="_blank"
									class="btn btn-outlined ext-link h-9"
								>
									{page.data.t('holdings.linkToLocal')}
								</a>
							</li>
						{/if}
					</div>
				{/if}
			{/each}
			{#if bibIds.at(0) && missingAtLeastOneLinkToItem()}
				{@const firstBibId = bibIds.at(0).bibId}
				<div class="mt-2">
					{#if linksByBibId[firstBibId]?.[holder.sigel]?.[BibDb.LinksToCatalog]}
						<li>
							<a
								href={linksByBibId[firstBibId][holder.sigel][BibDb.LinksToCatalog].at(0)}
								target="_blank"
								class="ext-link"
							>
								{page.data.t('holdings.linkToCatalog')}
							</a>
						</li>
					{:else if linksByBibId[firstBibId]?.[holder.sigel]?.[BibDb.LinksToSite]}
						<li>
							<a
								href={linksByBibId[firstBibId][holder.sigel][BibDb.LinksToSite].at(0)}
								target="_blank"
								class="ext-link"
							>
								{page.data.t('holdings.linkToSite')}
							</a>
						</li>
					{/if}
				</div>
			{/if}
		</ul>
		{#if linksByBibId[bibIds.at(0).bibId]?.[holder.sigel]?.[BibDb.ItemStatus]}
			<details ontoggle={getHoldingStatus}>
				<summary class="mt-3 flex cursor-pointer items-baseline">
					<span class="arrow text-subtle mr-2 h-3 origin-center rotate-0 transition-transform">
						<BiChevronRight />
					</span>
					Visa tillgänglighet
				</summary>
				<div class="mb-4 flex flex-col gap-2">
					{#if loading}
						<p>{page.data.t('search.loading')}</p>
					{/if}
					{#if error}
						<div
							class="status-container border-neutral bg-page mt-2 max-w-md rounded-sm border p-2"
						>
							<p class="error" role="alert">{error}</p>
						</div>
					{/if}
					{#if statusData && statusData.length > 0}
						{#each statusData as instance, index (index)}
							{#if instance?.item_information}
								{@const items = instance.item_information}
								<div
									class="status-container border-neutral bg-page mt-4 flex max-w-md flex-col gap-4 rounded-sm border p-2"
								>
									{#if items.error || items.count === 0}
										{#if urlNotDefinedError(items.error)}
											<p class="library-unavailable">{page.data.t('holdings.libraryUnvaliable')}</p>
										{:else}
											<p class="error" role="alert">{page.data.t('holdings.loanStatusFailed')}</p>
										{/if}
									{/if}
									{#each items.items as item, index (index)}
										{@const indicator = getIndicator(item.Status)}
										<table>
											<tbody class="text-xs leading-relaxed">
												<tr>
													<th>{page.data.t('holdings.location')}</th>
													<td>{item.Location}</td>
												</tr>
												<tr>
													<th>{page.data.t('holdings.shelf')}</th>
													<td>
														{item.Call_No}
														<!-- show map link only if absolute url -->
														{#if item.Map && (item.Map.startsWith('http://') || item.Map.startsWith('https://'))}
															(<a href={item.Map} target="_blank" class="ext-link">
																{page.data.t('holdings.map')}</a
															>)
														{/if}
													</td>
												</tr>
												<tr>
													<th>{page.data.t('holdings.loanPolicy')}</th>
													<td>{item.Loan_Policy}</td>
												</tr>
												<tr>
													<th>{page.data.t('holdings.status')}</th>
													<td>
														{#if indicator}
															<span class={`indicator ${indicator}`}></span>
															{page.data.t(`holdings.${indicator}`)}
														{:else}
															{item.Status}
														{/if}
													</td>
												</tr>
												{#if item.Status_Date}
													<tr>
														<th>{page.data.t('holdings.date')}</th>
														<td>{item?.Status_Date_Description} {item.Status_Date}</td>
													</tr>
												{/if}
											</tbody>
										</table>
									{/each}
								</div>
							{/if}
						{/each}
					{/if}
				</div>
			</details>
		{/if}
	</div>
	<details>
		<summary class="my-3 flex cursor-pointer items-baseline">
			<span class="arrow text-subtle mr-2 h-3 origin-center rotate-0 transition-transform">
				<BiChevronRight />
			</span>
			{page.data.t('holdings.openingHoursEtc')}
		</summary>
		<span>
			{#if bibIds.at(0)}
				{@const firstBibId = bibIds.at(0).bibId}
				<ul class="my-2" style="white-space: pre-line">
					{#if linksByBibId[firstBibId]?.[holder.sigel]?.[BibDb.OpeningHours]}
						<li>
							{linksByBibId[firstBibId][holder.sigel][BibDb.OpeningHours].at(0)}
						</li>
					{/if}
					{#if linksByBibId[firstBibId]?.[holder.sigel]?.[BibDb.Address]}
						{#each linksByBibId[firstBibId][holder.sigel][BibDb.Address] as address (address)}
							<li class="my-2">
								{address}
							</li>
						{/each}
					{/if}
				</ul>
			{/if}
		</span>
	</details>
</li>

<style lang="postcss">
	@reference "../../../../app.css";

	details[open] {
		& .arrow {
			@apply rotate-90;
		}

		& .holder-label {
			white-space: normal;
		}
	}

	.holder-label {
		@apply flex-1 overflow-hidden text-ellipsis whitespace-nowrap;
		font-weight: bold;
	}

	.status-container {
		&:has(p.error) {
			background-color: var(--color-warning-100);
		}

		/* don't repeat the library-unavailable message for every instance */
		&:has(p.library-unavailable):not(:first-of-type) {
			display: none;
		}
	}

	table th {
		font-weight: var(--font-weight-medium);
		width: calc(var(--spacing) * 24);
		padding-right: calc(var(--spacing) * 4);
		vertical-align: baseline;
	}

	table td {
		width: auto;
	}

	.instance-token {
		color: var(--color-subtle);
	}

	.indicator {
		@apply mb-0.5 inline-block h-2.5 w-2.5 rounded-full align-middle;

		&.unavailable {
			background-color: var(--color-severe-500);
		}
		&.available {
			background-color: var(--color-success);
		}
	}
</style>
