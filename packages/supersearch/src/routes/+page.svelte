<script lang="ts">
	import SuperSearch from '$lib/components/SuperSearch.svelte';

	let value = $state('');
	let placeholder = $state('Search');
</script>

<form action="test1">
	<fieldset data-test-id="test1">
		<legend>Supersearch inside <code>&lt;form&gt;</code> element</legend>
		<SuperSearch bind:value {placeholder} />
		<textarea {value} hidden readonly name="q" maxlength={2048}></textarea>
	</fieldset>
	<fieldset data-test-id="test2">
		<legend>Supersearch using <code>form</code> attribute</legend>
		<SuperSearch bind:value {placeholder} form="form-outside" />
	</fieldset>
	<label>Placeholder:<input type="text" bind:value={placeholder} /></label>
</form>

<form action="test2" id="form-outside">
	<textarea {value} hidden readonly name="q" maxlength={2048}></textarea>
</form>
