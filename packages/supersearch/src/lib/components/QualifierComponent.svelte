<script lang="ts">
	import type { Qualifier } from '$lib/extensions/qualifierPlugin.js';
	import { onMount } from 'svelte';

	type QualifierWidgetProps = {
		qualifier: Qualifier;
		range: { from: number; to: number };
		update: any
	};

	let { qualifier, range, update }: QualifierWidgetProps = $props();

	// todo from search.mappings
	let keyLabel : string | undefined;
	let valueLabel : string | undefined;
	
	let keyDisplay : string | undefined = keyLabel || qualifier.key.replace(/['"]+/g, '');
	let valueDisplay : string | undefined = valueLabel || qualifier.value?.replace(/['"]+/g, '');

	// can't edit the value if we show the label, i.e 'Astrid Lindgren'
	const isEditable = !valueLabel;

	let editableElem : HTMLElement | undefined;
	let prevValue: undefined | string = valueDisplay;
	
	onMount(() => {
		console.log('mounted qualifier component')
		if (isEditable) {
			editableElem?.addEventListener('focus', onfocus)
		}
		if (!qualifier.value) {
			editableElem && focusValueInput(editableElem);
		}
	})

	function onfocus(){
		console.log('focus')
		editableElem?.removeEventListener('focus', onfocus)
		editableElem?.addEventListener('focusout', onFocusout)
	}
	
	function onFocusout() {		
		console.log('focusout')
		syncValue();
		editableElem?.addEventListener('focus', onfocus);
		editableElem?.removeEventListener('focusout', onFocusout)
	}
	
	// take over cursor & input from codemirror
	function focusValueInput(elem: HTMLElement) {
		elem?.focus();
		elem && window.getSelection()?.selectAllChildren(elem);
		window.getSelection()?.collapseToStart();
	}

	function syncValue() {
		console.log('syncing...')
		let value = editableElem?.innerText;
		if (value !== prevValue) {
			prevValue = value;
			const text = `"${keyDisplay}"${qualifier.operator}"${value}"`;
			update({ range, text })
			console.log('emitted ', range, text)
		}
	}

</script>

<span class="qualifier">
	<!-- <span class="qualifier-key">
		{keyDisplay}
	</span> -->
	<span class="qualifier-operator">
		{qualifier.operator}
	</span>
	<span bind:this={editableElem} class="qualifier-value" contenteditable={isEditable ? 'true' : 'false'}>
		{valueDisplay}
	</span>
</span>
<!-- &nbsp; -->

<style>
	.qualifier {
		display: inline-flex;
		align-items: baseline;
		border-radius: 4px;
		background: rgba(14, 113, 128, 0.15);
		padding: 0;
		max-width: 25vw;
		overflow: hidden;
		font-weight: 500;
		line-height: 1;
		white-space: nowrap;
	}

	.qualifier-key {
		display: inline-flex;
		align-items: center;
	}

	.qualifier-value {
		/* display: inline-flex;
		align-items: center;
		 */
		overflow: hidden;
		min-width: 5px;
		color: #0e7180;
		/* text-overflow: ellipsis;
		white-space: nowrap; */
	}

	.qualifier-value:focus-visible {
		outline: 0;
	}

	a {
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		border: none;
		padding: 1px;
		min-width: 24px;
		min-height: 24px;
		color: var(--color-link);

		&:hover {
			background: rgba(0, 0, 0, 0.05);
		}
	}
</style>
