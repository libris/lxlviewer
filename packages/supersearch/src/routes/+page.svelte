<script lang="ts">
	import SuperSearch from '$lib/components/SuperSearch.svelte';
	import { PUBLIC_ENDPOINT_URL } from '$env/static/public';

	let value1 = $state('');
	let value2 = $state('');
	let placeholder = $state('Search');
</script>

<form action="test1">
	<fieldset data-test-id="test1">
		<legend>Supersearch inside <code>&lt;form&gt;</code> element</legend>
		<SuperSearch
			name="q"
			bind:value={value1}
			{placeholder}
			endpoint={new URL(PUBLIC_ENDPOINT_URL)}
		/>
	</fieldset>
</form>

<form>
	<fieldset data-test-id="test2">
		<legend>Supersearch using <code>form</code> attribute</legend>
		<SuperSearch
			name="q"
			bind:value={value2}
			{placeholder}
			form="form-outside"
			endpoint={new URL(PUBLIC_ENDPOINT_URL)}
		/>
	</fieldset>
</form>

<form action="test2" id="form-outside"></form>

<label>Placeholder:<input type="text" bind:value={placeholder} /></label>
