<script lang="ts">
	import { type HoldingStatus } from '$lib/types/api';
	import type { BibIdObj, DecoratedHolder } from '$lib/types/holdings';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import { page } from '$app/stores';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import BiChevronRight from '~icons/bi/chevron-right';

	export let holder: DecoratedHolder;
	export let holdingUrl: string;

	const sigel = holder?.sigel;
	let loading = false;
	let statusData: HoldingStatus[] | undefined;
	let error: string | undefined;

	// if holdingUrl is an instance fnurgel, add its mapped bibId object into arr,
	// else add all ids of current type with holdings for current sigel
	$: bibIds = $page.data.bibIdsByInstanceId[holdingUrl]
		? [$page.data.bibIdsByInstanceId[holdingUrl]]
		: Object.keys($page.data.bibIdsByInstanceId)
				.filter((i) => $page.data.bibIdsByInstanceId[i]['@type'] === holdingUrl)
				.filter((i) => $page.data.bibIdsByInstanceId[i].holders.includes(sigel))
				.map((i) => $page.data.bibIdsByInstanceId[i]);

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
					error = `${$page.data.t('holdings.loanStatusFailed')}: ${response?.status} ${response?.statusText}`;
				}
			})
		);
		return data;
	}

	async function getHoldingStatus() {
		if (!sigel || !bibIds || bibIds.length < 1) {
			error = $page.data.t('holdings.loanStatusFailed');
		} else if (!statusData) {
			loading = true;

			fetchHoldingStatus(bibIds)
				.then((data) => {
					statusData = data;
					loading = false;
				})
				.catch((err) => {
					error = `${$page.data.t('holdings.loanStatusFailed')}: ${err}`;
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
</script>

<li class="border-b-primary/16 [&:not(:last-child)]:border-b">
	<details on:toggle={getHoldingStatus}>
		<summary class="my-3 flex items-baseline">
			<span class="arrow mr-2 h-3">
				<BiChevronRight />
			</span>
			<span class="holder-label">
				<DecoratedData data={holder.obj} showLabels={ShowLabelsOptions['Never']} />
			</span>
		</summary>
		<div class="mb-4 flex flex-col gap-2">
			{#if loading}
				<p>{$page.data.t('search.loading')}</p>
			{/if}
			{#if error}
				<div class="status-container">
					<p class="error" role="alert">{error}</p>
				</div>
			{/if}
			{#if statusData && statusData.length > 0}
				{#each statusData as instance}
					{#if instance && instance.item_information}
						{@const items = instance.item_information}
						<div class="status-container flex flex-col gap-4">
							{#if items.error || items.count === 0}
								{#if urlNotDefinedError(items.error)}
									<p class="library-unavailable">{$page.data.t('holdings.libraryUnvaliable')}</p>
								{:else}
									<p class="error" role="alert">{$page.data.t('holdings.loanStatusFailed')}</p>
								{/if}
							{/if}
							{#each items.items as item}
								{@const indicator = getIndicator(item.Status)}
								<table>
									<tbody>
										<tr>
											<th>{$page.data.t('holdings.location')}</th>
											<td>{item.Location}</td>
										</tr>
										<tr>
											<th>{$page.data.t('holdings.shelf')}</th>
											<td>
												{item.Call_No}
												<!-- show map link only if absolute url -->
												{#if item.Map && (item.Map.startsWith('http://') || item.Map.startsWith('https://'))}
													(<a href={item.Map} target="_blank" class="ext-link">
														{$page.data.t('holdings.map')}</a
													>)
												{/if}
											</td>
										</tr>
										<tr>
											<th>{$page.data.t('holdings.loanPolicy')}</th>
											<td>{item.Loan_Policy}</td>
										</tr>
										<tr>
											<th>{$page.data.t('holdings.status')}</th>
											<td>
												{#if indicator}
													<span class={`indicator ${indicator}`}></span>
													{$page.data.t(`holdings.${indicator}`)}
												{:else}
													{item.Status}
												{/if}
											</td>
										</tr>
										{#if item.Status_Date}
											<tr>
												<th>{$page.data.t('holdings.date')}</th>
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
</li>

<style lang="postcss">
	details[open] {
		& .arrow {
			@apply rotate-90;
		}

		& .holder-label {
			@apply whitespace-normal;
		}
	}

	.holder-label {
		@apply flex-1 overflow-hidden text-ellipsis whitespace-nowrap;
	}

	.arrow {
		transform-origin: center;
		@apply rotate-0 transition-transform;
	}

	.status-container {
		@apply max-w-md rounded-sm border border-primary/16 p-2;

		&:has(p.error) {
			@apply bg-negative;
		}

		/* don't repeat the library-unavailable message for every instance */
		&:has(p.library-unavailable):not(:first-of-type) {
			@apply hidden;
		}
	}

	table th {
		@apply w-24 pr-4 align-baseline;
	}

	table td {
		@apply w-auto;
	}

	.indicator {
		@apply mb-0.5 inline-block h-2.5 w-2.5 rounded-full align-middle;

		&.unavailable {
			@apply bg-[#dc110f];
		}
		&.available {
			@apply bg-[#2ab061];
		}
	}
</style>
