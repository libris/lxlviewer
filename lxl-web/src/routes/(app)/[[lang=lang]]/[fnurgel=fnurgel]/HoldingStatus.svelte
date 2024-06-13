<script lang="ts">
	import { type HoldingStatus } from '$lib/types/api';
	import { relativizeUrl } from '$lib/utils/http';
	export let data;
	export let bibId;

	let loading = false;
	let statusData: HoldingStatus | null = null;
	let error: string | null = null;
	const sigel = data?.heldBy?.sigel;
	const instanceId = relativizeUrl(bibId)?.replace('resourcebib', ''); // TODO better! (is there an existing lxljs util for this?)

	async function getHoldingStatus() {
		if (!sigel || !instanceId) {
			error = 'could not retrieve data';
		} else if (!statusData) {
			loading = true;
			const res = await fetch(`/api/holdingstatus?sigel=${sigel}&bib_id=${instanceId}`);
			const resJson = await res.json();

			if (resJson.item_information.error) {
				error = resJson.item_information.error;
			} else {
				statusData = resJson;
			}
			loading = false;
		}
	}
</script>

<details on:toggle={getHoldingStatus}>
	<slot />
	<div class="my-4">
		{#if loading}
			<span>Laddar....</span>
		{/if}
		{#if error}
			{error}
		{/if}
		{#if statusData && statusData.item_information.items.length > 0}
			<!-- TODO properly -->
			<!-- ripped from https://github.com/libris/search4/blob/09180a39077619b2e4f4ba0887f9474679b40489/src/views/ProductPage/Work/Holding.vue#L124 -->
			{#each statusData.item_information.items as item}
				<table class="my-2">
					<tbody>
						<tr>
							<th>Placering</th>
							<td>{item.Location}</td>
						</tr>
						<tr>
							<th>Hylla</th>
							<td>{item.Call_No}</td>
						</tr>
						<tr>
							<th>Lånepolitik</th>
							<td>{item.Loan_Policy}</td>
						</tr>
						<tr>
							<th>Status</th>
							<td>{item.Status}</td>
						</tr>
						<tr>
							<th>Datum</th>
							<td>{item.Status_Date}</td>
						</tr>
					</tbody>
				</table>
			{/each}
		{/if}
	</div>
</details>
