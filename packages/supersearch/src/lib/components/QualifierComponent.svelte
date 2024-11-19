<script lang="ts">
	// import type { Qualifier } from '$lib/utils/supersearch/qualifiers';
	// import IconPerson from '~icons/mdi/person-circle';
	// import IconClose from '~icons/mdi/remove';
	import { page } from '$app/stores';
	import type { Qualifier } from '$lib/extensions/qualifier.js';
	import { onDestroy, onMount } from 'svelte';

	type QualifierWidgetProps = {
		qualifier: Qualifier;
		range: { from: number; to: number };
		update: any
	};

	let { qualifier, range, update }: QualifierWidgetProps = $props();

	// can't edit the value if we show the label, i.e 'Astrid Lindgren'
	const isEditable = !qualifier.valueLabel;
	let editableElem : HTMLElement | undefined;
	let prevValue = qualifier.value
	
	onMount(() => {
		console.log('mounted component')
		if (isEditable && !qualifier.value) {
			if (editableElem) {
				editableElem && focusValueInput(editableElem);
				editableElem.addEventListener('focusout', syncValue)
			}
		}
	})

	onDestroy(() => {
		// remove event listeners?
		console.log('destroying')
	})
	
	// take over cursor, input from codemirror
	function focusValueInput(elem: HTMLElement) {
		elem?.focus();
		elem && window.getSelection()?.selectAllChildren(elem);
		window.getSelection()?.collapseToStart();
	}

	function syncValue() {
		console.log('syncing...')
		let value = editableElem?.innerText;
		if (prevValue !== value) {
			console.log('emitting', value)
			update({
				range,
				text: `${qualifier.key}${qualifier.operator}"${value}"`
			})
			prevValue = value;
		}

	}

	// FIX: no hardcoded _q
	let removeUrl = $derived.by(() => {
		const url = new URL($page.url);
		const _q = $page.url.searchParams.get('_q');
		if (_q) {
			url.searchParams.set('_q', _q.slice(0, range.from) + _q.slice(range.to)); // remove qualifier part
		}
		return url;
	});
</script>

<span class="qualifier">
	<span class="qualifier-key">
		{qualifier.keyLabel || qualifier.key}
	</span>
	<span class="qualifier-operator">
		{qualifier.operator}
	</span>
	<span bind:this={editableElem} class="qualifier-value" contenteditable={isEditable ? 'true' : 'false'}>
		{qualifier.valueLabel || qualifier.value}
	</span>
	<a href={removeUrl.toString()} tabindex="-1">
		<!-- <IconClose style="font-size:14px;" /> -->
		X
	</a>
</span>&nbsp;

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

	/* .type > span {
    &::first-letter {
      text-transform: capitalize;
    }
  } */

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

	/* .value > span {
    align-self: center;
  } */

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
