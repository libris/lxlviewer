<script lang="ts">
	import type { PageServerData } from './$types';
	export let data: PageServerData;
</script>

<div class="record-page">
	<div class="record">
		<h1>{data.title}</h1>
		<div>Not much to see here yet...</div>
	</div>
</div>

<style lang="scss">
	.record-page {
		padding: var(--padding-page);
	}
	@media screen and (min-width: $layout-breakpoint-large) {
		.record-page {
			display: grid;
			grid-template-areas: 'record record .';
			grid-template-columns: 1fr 2fr 1fr;
		}

		.record {
			grid-area: record;
		}
	}
</style>
