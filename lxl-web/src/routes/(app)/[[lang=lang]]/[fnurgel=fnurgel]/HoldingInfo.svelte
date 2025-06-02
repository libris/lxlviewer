<script lang="ts">
	import { page } from '$app/state';
	import type { BibIdObj, DecoratedHolder, ItemLinksByBibId } from '$lib/types/holdings';
	import { BibDb } from '$lib/types/xl';
	import type { HoldingStatus } from '$lib/types/api';
	import BiChevronRight from '~icons/bi/chevron-right';
	import BiChevronDown from '~icons/bi/chevron-down';
	import Spinner from '$lib/components/Spinner.svelte';

	type HoldingInfoProps = {
		id: BibIdObj;
		holder: DecoratedHolder;
		linksByBibId: ItemLinksByBibId;
		isSingle: boolean;
	};

	const { id, holder, linksByBibId, isSingle }: HoldingInfoProps = $props();

	const sigel = holder?.sigel;
	let loading = $state(false);
	let expandedHoldingAvailability = $state(false);
	let statusData: HoldingStatus[] | undefined = $state();
	let error: string | undefined = $state();
	let bibIds: BibIdObj[] = [id];

	function hasInstanceContent(id: string) {
		return hasLoanReserveLink(id) || hasLinksToItem(id) || hasStatusLink(id);
	}

	function hasStatusLink(id: string) {
		return linksByBibId[id][holder.sigel][BibDb.ItemStatus];
	}

	function hasLinksToItem(id: string) {
		return linksByBibId[id]?.[holder.sigel]?.[BibDb.LinksToItem];
	}

	function hasLoanReserveLink(id: string) {
		return linksByBibId[id]?.[holder.sigel]?.[BibDb.LoanReserveLink];
	}

	async function holdingStatusClicked() {
		expandedHoldingAvailability = !expandedHoldingAvailability;
		await getHoldingStatus();
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

	function urlNotDefinedError(err: string | undefined) {
		if (
			err &&
			err === `URL till lånestatus för ${sigel} ej definierad i LIBRIS biblioteksdatabas!`
		) {
			return true;
		}
		return false;
	}

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
</script>

{#if linksByBibId[id.bibId]?.[holder.sigel]}
	{@const linksForHolder = linksByBibId[id.bibId][holder.sigel]}
	{#if hasInstanceContent(id.bibId)}
		{#if isSingle}
			<div class="text-subtle">{id.str || '-'}</div>
		{/if}
		{#if hasLoanReserveLink(id.bibId)}
			<a
				href={linksForHolder['loanReserveLink'].at(0)}
				target="_blank"
				class="ext-link mr-2 h-9 max-w-sm align-top"
			>
				{page.data.t('holdings.loanReserveLink')}
			</a>
		{:else if hasLinksToItem(id.bibId)}
			<a
				href={linksForHolder[BibDb.LinksToItem].at(0)}
				target="_blank"
				class="ext-link mr-2 h-9 max-w-sm align-top"
			>
				{page.data.t('holdings.linkToLocal')}
			</a>
		{/if}
		{#if hasStatusLink(id.bibId)}
			<button onclick={holdingStatusClicked}>
				<div class="text-subtle link-subtle flex cursor-pointer items-baseline">
					{#if !expandedHoldingAvailability}
						<span
							class="text-3xs arrow text-subtle mr-0.5 h-3 origin-center rotate-0 transition-transform"
						>
							<BiChevronRight />
						</span>
					{:else}
						<span
							class="text-3xs arrow text-subtle mr-0.5 h-3 origin-center rotate-0 transition-transform"
						>
							<BiChevronDown />
						</span>
					{/if}
					{page.data.t('holdings.loanStatus')}
				</div>
			</button>
			<div class="mb-4">
				{#if loading}
					<div
						class="status-container border-neutral bg-page mt-2 flex max-w-md flex-col gap-4 rounded-sm border p-2"
					>
						<span class="-mt-0.5 block size-4" in:fade={{ duration: 200 }}>
							<Spinner />
						</span>
					</div>
				{/if}
				{#if error}
					<div class="status-container border-neutral bg-page mt-2 max-w-md rounded-sm border p-2">
						<p class="error" role="alert">{error}</p>
					</div>
				{/if}
				{#if statusData && statusData.length > 0 && expandedHoldingAvailability}
					{#each statusData as instance, index (index)}
						{#if instance?.item_information}
							{@const items = instance.item_information}
							<div
								class="status-container border-neutral bg-page mt-2 flex max-w-md flex-col gap-4 rounded-sm border p-2"
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
		{/if}
	{/if}
{/if}

<style lang="postcss">
	@reference "../../../../app.css";

	h2 {
		@apply mb-2;
	}

	li {
		@apply mb-2;
	}

	.show-all {
		@apply text-subtle;
		text-decoration: underline;
		text-decoration-style: dotted;
	}

	.bib-list li {
		display: list-item;
	}
	.bib-list.instancesCollapsed li:nth-child(n + 6) {
		display: none;
	}

	details[open] {
		& .arrow {
			@apply rotate-90;
		}
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
