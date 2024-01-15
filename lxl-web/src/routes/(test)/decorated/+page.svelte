<script lang="ts">
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import exampleDecorated from '$lib/assets/json/exampleDecorated.json';
	import CustomTestComponent from './CustomTestComponent.svelte';

	let showCustomComponent = '';
	let showSpan = true;

	function getCustomComponent(showCustomComponent: string) {
		if (showCustomComponent == 'all') {
			return CustomTestComponent;
		}

		if (showCustomComponent == 'specific') {
			return { givenName: CustomTestComponent };
		}
	}
</script>

<div class="toolbar">
	<label><input type="checkbox" bind:checked={showSpan} />Span elements</label>
	<label><input type="radio" bind:group={showCustomComponent} value="" />Default</label>
	<label
		><input type="radio" bind:group={showCustomComponent} value="all" />Custom component for all
		properties</label
	>
	<label
		><input type="radio" bind:group={showCustomComponent} value="specific" />Custom component for
		givenName</label
	>
</div>
<DecoratedData
	data={exampleDecorated}
	customComponent={getCustomComponent(showCustomComponent)}
	elementType={showSpan ? 'span' : ''}
/>

<style>
	.toolbar {
		background: #ebebeb;
		padding: 16px;
	}
</style>
