<script lang="ts">
	import { type HoldingStatus } from '$lib/types/api';
	import { page } from '$app/stores';
	export let sigel: string;
	export let holdingUrl: string;
	import BiChevronRight from '~icons/bi/chevron-right';

	let loading = false;
	let statusData: HoldingStatus[] | void[] | undefined;
	let error: string | null = null;

	// if holdingUrl is an instance fnurgel, add its mapped bibId into arr,
	// else add all ids of current type with holdings for current sigel
	$: bibIds = $page.data.bibIdsByInstanceId[holdingUrl]
		? [$page.data.bibIdsByInstanceId[holdingUrl].bibId]
		: Object.keys($page.data.bibIdsByInstanceId)
				.filter((i) => $page.data.bibIdsByInstanceId[i]['@type'] === holdingUrl)
				.filter((i) => $page.data.bibIdsByInstanceId[i].holders.includes(sigel))
				.map((i) => $page.data.bibIdsByInstanceId[i].bibId);

	async function fetchHoldingStatus(ids: string[]) {
		const promises = ids.map((id) => {
			if (id) {
				return fetch(`/api/holdingstatus?sigel=${sigel}&bib_id=${id}`);
			}
		});

		const responses = await Promise.all(promises);
		const data = await Promise.all(
			responses.map((response) => {
				if (response && response.ok) {
					return response.json();
				} else {
					error = $page.data.t('holdings.loanStatusFailed');
				}
			})
		);
		return data;
	}

	async function getHoldingStatus() {
		if (!sigel || !bibIds || bibIds.length < 1) {
			error = $page.data.t('holdings.loanStatusNotAvailable');
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
				case 'utlånad':
				case 'not available':
					return 'unavailable';
				default:
					return false;
			}
		}
		return false;
	}
</script>

<li class="border-b-primary/16 [&:not(:last-child)]:border-b">
	<details on:toggle={getHoldingStatus}>
		<summary class="flex h-11 items-center">
			<span class="arrow mr-2">
				<BiChevronRight />
			</span>
			<slot name="name" />
			<span class="text-secondary">{sigel ? `(${sigel})` : ''}</span>
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
						<div class="status-container flex flex-col gap-4">
							{#if instance.item_information.error || instance.item_information.count === 0}
								<p class="error" role="alert">{$page.data.t('holdings.loanStatusNotAvailable')}</p>
							{/if}
							{#each instance.item_information.items as item}
								{@const indicator = getIndicator(item.Status)}
								<table>
									<tbody>
										<tr>
											<th>{$page.data.t('holdings.location')}</th>
											<td>{item.Location}</td>
										</tr>
										<tr>
											<th>{$page.data.t('holdings.shelf')}</th>
											<td>{item.Call_No}</td>
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
	.arrow {
		transform-origin: center;
		@apply rotate-0 transition-transform;
	}

	details[open] .arrow {
		@apply rotate-90;
	}

	table {
		table-layout: fixed;

		& th {
			@apply w-24 pr-4;
		}

		& td {
			@apply w-auto;
		}
	}

	.status-container {
		@apply max-w-md rounded-sm border border-primary/16 p-2;

		&:has(p.error) {
			@apply bg-negative;
		}
	}

	.indicator {
		@apply mb-0.5 inline-block h-[10px] w-[10px] rounded-full align-middle;

		&.unavailable {
			@apply bg-[#dc110f];
		}
		&.available {
			@apply bg-[#2ab061];
		}
	}
</style>
