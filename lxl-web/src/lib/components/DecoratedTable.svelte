<script lang="ts">
	import DecoratedData from './DecoratedData.svelte';
	import { relativizeUrl } from '$lib/utils/http';
	import { isObject } from '$lib/utils/xl';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';

	export let data: DecoratedData;

	enum ExtendedPropertySelectorType {
		AlternateProperties = 'alternateProperties',
		SubPropertyOf = 'subPropertyOf',
		Range = 'range'
	}

	export let columns: (string | Record<ExtendedPropertySelectorType, string>)[] = [];

	function findProperty(
		data: DecoratedData,
		propertySelector: string | Record<ExtendedPropertySelectorType, string>
	) {
		if (isObject(propertySelector)) {
			if (propertySelector.subPropertyOf) {
				// we're not using range yet...
				const subProperty = findAllByKey(data, propertySelector.subPropertyOf);
				return findProperty(subProperty, propertySelector.propertyName);
			}
			if (
				propertySelector.alternateProperties &&
				Array.isArray(propertySelector.alternateProperties)
			) {
				const firstProperty = propertySelector.alternateProperties.find((ap) =>
					findAllByKey(data, ap)
				);
				return findProperty(data, firstProperty);
			}
		}
		return findAllByKey(data, propertySelector)[0];
	}

	/**
	 * 							"alternateProperties": [
								{ "subPropertyOf": "hasTitle", "range": "KeyTitle" },
								{ "subPropertyOf": "hasTitle", "range": "Title" },
								"hasTitle"
							]
	*/

	function findAllByKey(data, keyToFind) {
		return Object.entries(data).reduce(
			(acc, [key, value]) =>
				key === keyToFind
					? acc.concat(value)
					: value && typeof value === 'object'
						? acc.concat(findAllByKey(value, keyToFind))
						: acc,
			[]
		);
	}
</script>

<table>
	<tbody>
		{#if Array.isArray(data)}
			{#each data as item (item['@id'])}
				<tr>
					{#each columns as columnItem}
						<td>
							<DecoratedData
								data={findProperty(item, columnItem)}
								showLabels={ShowLabelsOptions.Never}
							/>
						</td>
					{/each}
					<td>
						<a href={relativizeUrl(item['@id'])}>
							{'>'}
						</a>
					</td>
				</tr>
			{/each}
		{/if}
	</tbody>
</table>

<style>
	table {
		table-layout: fixed;
		width: 100%;
	}

	tr {
		& td {
			padding: 1rem 0;
		}
		& td:first-child,
		& td:last-child {
			padding: 1rem;
		}

		&:nth-child(even) {
			background-color: #f0eee9;
		}
	}
</style>
