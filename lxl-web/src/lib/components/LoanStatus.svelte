<script lang="ts">
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { fade } from 'svelte/transition';
	import type { BibIdObj } from '$lib/types/holdings';
	import type { HoldingStatus } from '$lib/types/api';
	import BiChevronDown from '~icons/bi/chevron-down';
	import Spinner from '$lib/components/Spinner.svelte';

	type HoldingInfoProps = {
		bibIdObj: BibIdObj;
		sigel: string;
	};

	const { bibIdObj, sigel }: HoldingInfoProps = $props();

	let loading = $state(false);
	let statusData: HoldingStatus[] | undefined = $state();
	let error: string | undefined = $state();
	let bibIds: BibIdObj[] = [bibIdObj];

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
				const searchParams = new SvelteURLSearchParams();
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

<details
	class="w-full"
	ontoggle={(e: Event & { currentTarget: HTMLDetailsElement }) => {
		if (e.currentTarget.open) {
			getHoldingStatus();
		}
	}}
>
	<summary class="link-subtle flex cursor-pointer items-center gap-1">
		<span class="text-3xs arrow text-subtle item-center flex h-3 origin-center rotate-0">
			<BiChevronDown />
		</span>
		<span>{page.data.t('holdings.loanStatus')}</span>
	</summary>
	<div
		class="status-container border-neutral bg-page mt-2 flex max-w-md flex-col gap-4 rounded-sm border p-2"
	>
		{#if loading}
			<span class="-mt-0.5 mr-auto ml-auto block size-4" in:fade={{ duration: 200 }}>
				<Spinner />
			</span>
		{/if}
		{#if error}
			<p class="error" role="alert">{error}</p>
		{/if}
		{#if statusData && statusData.length > 0}
			{#each statusData as instance, index (index)}
				{#if instance?.item_information}
					{@const items = instance.item_information}
					<div class="flex flex-col gap-2">
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
												<span
													class={`indicator mb-0.5 inline-block h-2.5 w-2.5 rounded-full align-middle ${indicator}`}
												></span>
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

<style lang="postcss">
	details[open] {
		& .arrow {
			transform: rotate(180deg);
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

	.indicator.unavailable {
		background-color: var(--color-severe-500);
	}

	.indicator.available {
		background-color: var(--color-success);
	}
</style>
