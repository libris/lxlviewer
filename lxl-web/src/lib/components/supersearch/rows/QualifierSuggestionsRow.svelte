<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { lxlQueryLanguage } from 'codemirror-lang-lxlquery';
	import { getSearchContext } from '$lib/contexts/search';
	import { type QualifierSuggestion2 } from '$lib/types/search';
	import { getParentNodeByType, type Selection } from 'supersearch';
	import IconMore from '~icons/bi/chevron-right';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	function debugLog(message: unknown) {
		if (env.PUBLIC_DEBUG_SUPERSEARCH && env.PUBLIC_DEBUG_SUPERSEARCH.toLowerCase() === 'true') {
			console.log('DEBUG ADD QUALIFIER KEY:', (message as object).toString());
		}
	}

	type Props = {
		rowIndex: number;
		getCellId: (rowIndex: number, cellIndex: number) => string | undefined;
		isFocusedRow: (rowIndex: number) => boolean | undefined;
		isFocusedCell: (rowIndex: number, cellIndex: number) => boolean | undefined;
		qualifierSuggestions: QualifierSuggestion2[];
		query: string;
		selection: Selection | undefined;
	};

	let {
		qualifierSuggestions,
		rowIndex,
		getCellId,
		isFocusedRow,
		isFocusedCell,
		query,
		selection
	}: Props = $props();

	const searchContext = getSearchContext();

	type QueryPart = { from: number; to: number; value: string };

	const maxQualifierLabelWords = $derived(
		page.data.qualifierSuggestions.reduce(
			(acc: number, qs: QualifierSuggestion2) =>
				Math.max(acc, (qs.label.match(/\s/g) || []).length),
			1
		)
	);

	function getFilteredQualifierSuggenstions(
		qualifierSuggestions: QualifierSuggestion2[],
		query: string,
		selection: Selection | undefined
	) {
		const SUGGESTIONS_LIMIT = 7;
		if (selection && query.length) {
			const tree = lxlQueryLanguage.parser.parse(query);
			const nodeBefore = tree.resolveInner(selection.from, -1);

			if (
				(nodeBefore.name === 'String' || nodeBefore.name === 'Query') &&
				!getParentNodeByType(nodeBefore, 'QualifierValue')
			) {
				const treeCursor = nodeBefore.cursor();
				let queryParts: QueryPart[] =
					nodeBefore.name === 'String' || nodeBefore.name === 'Query'
						? [
								{
									from: nodeBefore.from,
									to: nodeBefore.to,
									value: query.slice(nodeBefore.from, nodeBefore.to)
								}
							]
						: [];

				while (
					queryParts.length <= maxQualifierLabelWords &&
					treeCursor.prevSibling() &&
					treeCursor.name === 'String'
				) {
					queryParts.unshift({
						from: treeCursor.from,
						to: treeCursor.to,
						value: query.slice(treeCursor.from, treeCursor.to)
					});
				}

				const filtered = qualifierSuggestions
					.map((qualifier) => getScoreAndReplaceSelection(qualifier, queryParts))
					.filter(({ score }) => score)
					.sort((a, b) => b.score - a.score)
					.slice(0, SUGGESTIONS_LIMIT);

				if (filtered.length) {
					return filtered;
				}
			}
		}

		return qualifierSuggestions
			.filter((qualifier) => typeof qualifier.showIn === 'number' && qualifier.showIn <= 0)
			.map((qualifier) => ({ qualifier }));
	}

	function getScoreAndReplaceSelection(qualifier: QualifierSuggestion2, queryParts: QueryPart[]) {
		return queryParts.reduce(
			(
				acc,
				part,
				index
			): {
				qualifier: QualifierSuggestion2;
				score: number;
				replaceSelection?: { from: number; to: number };
			} => {
				const needle = queryParts
					.slice(index)
					.map((p) => p.value.toLowerCase())
					.join(' ');
				let partScore = 0;
				if (prefixMatch(needle, qualifier.label)) {
					partScore += 20;
				}
				if (prefixMatch(needle, qualifier.key)) {
					partScore += 10;
				}
				for (const s of qualifier.queryCodes) {
					if (prefixMatch(needle, s)) {
						partScore += 1;
					}
				}
				for (const s of qualifier.altLabels) {
					if (prefixMatch(needle, s)) {
						partScore += 1;
					}
				}
				if (partScore) {
					if (qualifier.showIn === 0 || qualifier.showIn === 1) {
						partScore += 10;
					}
					return {
						qualifier,
						score: acc.score + partScore,
						replaceSelection: {
							from:
								index && acc.replaceSelection && typeof acc.replaceSelection.from === 'number'
									? acc.replaceSelection.from
									: part.from,
							to: part.to
						}
					};
				}
				return acc;
			},
			{ qualifier, score: 0 }
		);
	}

	function prefixMatch(needle: string, haystack: string) {
		return haystack.toLowerCase().startsWith(needle);
	}

	function addQualifierKey(qualifierKey: string, replaceSelection?: { from: number; to: number }) {
		const userEvent = 'input.complete';

		searchContext.showExpandedSearch(); // keep dialog open (since 'regular' search is hidden on mobile)

		if (replaceSelection) {
			const insert = `${qualifierKey}:()`;
			searchContext.changeQuery({
				change: {
					from: replaceSelection.from,
					to: replaceSelection.to,
					insert
				},
				selection: {
					anchor: replaceSelection.from + insert.length - 1,
					head: replaceSelection.from + insert.length - 1
				},
				userEvent
			});
			return;
		} else if (selection) {
			const tree = lxlQueryLanguage.parser.parse(query);
			const nodeBefore = tree.resolveInner(selection.head, -1);
			const node = tree.resolveInner(selection.head, 0);
			const nodeAfter = tree.resolveInner(selection.head, 1);

			const hasCharBefore = /\S/.test(query.charAt(selection.from - 1));
			const hasCharAfter = /\S/.test(query.charAt(selection.to));

			if (node.type.name === 'Qualifier' || node.type.name === 'QualifierOuterGroup') {
				debugLog('add qualifier key after Qualifier or QualifierOuterGroup');
				const insert = ` ${qualifierKey}:()`;
				searchContext.changeQuery({
					change: {
						from: node.to,
						to: node.to,
						insert
					},
					selection: {
						anchor: node.to + insert.length - 1,
						head: node.to + insert.length - 1
					},
					userEvent
				});
				return;
			}

			if (
				node.parent?.type.name === 'QualifierValue' ||
				node.parent?.type.name === 'QualifierOuterGroup'
			) {
				debugLog('insert value after parent QualifierValue or parent QualifierOuterpGroup');
				const insert = ` ${qualifierKey}:()`;
				searchContext.changeQuery({
					change: {
						from: node.parent.to,
						to: node.parent.to,
						insert
					},
					selection: {
						anchor: node.parent.to + insert.length - 1,
						head: node.parent.to + insert.length - 1
					},
					userEvent
				});
				return;
			}

			if (
				!selection.empty &&
				(nodeBefore.type.name === 'Query' || nodeBefore.type.name === 'String') &&
				(nodeAfter.type.name === 'Query' || nodeAfter.type.name === 'String')
			) {
				debugLog(
					'add selected value as qualifier key if both anchor and head is Qualifier or String'
				);
				const slicedValue = query.slice(selection.from, selection.to);
				const insert =
					(hasCharBefore ? ' ' : '') +
					`${qualifierKey}:(${slicedValue})` +
					(hasCharAfter ? ' ' : '');
				searchContext.changeQuery({
					change: {
						from: selection.from,
						to: selection.to,
						insert
					},
					selection: {
						anchor: selection.from + insert.length - (hasCharAfter ? 2 : 1),
						head: selection.from + insert.length - (hasCharAfter ? 2 : 1)
					},
					userEvent
				});
				return;
			}

			if (!hasCharBefore && !hasCharAfter) {
				debugLog('add qualifier key on empty input');
				const insert = `${qualifierKey}:()`;
				searchContext.changeQuery({
					change: {
						from: selection.head,
						to: selection.head,
						insert
					},
					selection: {
						anchor: selection.head + insert.length - 1,
						head: selection.head + insert.length - 1
					},
					userEvent
				});
				return;
			}

			if (hasCharBefore && !hasCharAfter) {
				debugLog('add qualifier key when selection is at end of string');
				const insert = ` ${qualifierKey}:()`;
				searchContext.changeQuery({
					change: {
						from: selection.head,
						to: selection.head,
						insert
					},
					selection: {
						anchor: selection.head + insert.length - 1,
						head: selection.head + insert.length - 1
					},
					userEvent
				});
				return;
			}

			if (!hasCharBefore && hasCharAfter) {
				debugLog('add qualifier key when selection is at start of string');
				const insert = `${qualifierKey}:() `;
				searchContext.changeQuery({
					change: {
						from: selection.head,
						to: selection.head,
						insert
					},
					selection: {
						anchor: selection.head + insert.length - 2,
						head: selection.head + insert.length - 2
					},
					userEvent
				});
				return;
			}

			if (
				hasCharBefore &&
				hasCharAfter &&
				nodeBefore.type.name === 'String' &&
				node.type.name === 'String' &&
				nodeAfter.type.name === 'String'
			) {
				debugLog('add qualifier key when selection is in the middle of string');
				const insert = ` ${qualifierKey}:()`;
				searchContext.changeQuery({
					change: {
						from: nodeAfter.to,
						to: nodeAfter.to,
						insert
					},
					selection: {
						anchor: node.to + insert.length - 1,
						head: node.to + insert.length - 1
					},
					userEvent
				});
				return;
			}

			if (node.type.name === 'Group') {
				debugLog('add qualifier key in group');

				const insert = `${qualifierKey}:()`;
				searchContext.changeQuery({
					change: {
						from: selection.head,
						to: selection.head,
						insert
					},
					selection: {
						anchor: selection.head + insert.length - 1,
						head: selection.head + insert.length - 1
					},
					userEvent
				});
				return;
			}
		}

		debugLog("Add qualifier key at end as fallback (e.g. if selection isn't available");
		const hasCharBefore = /\S/.test(query.charAt(Math.max(0, query.length - 1)));
		const insert = `${hasCharBefore ? ' ' : ''}${qualifierKey}:()`;
		searchContext.changeQuery({
			change: {
				from: query.length,
				to: query.length,
				insert
			},
			selection: {
				anchor: query.length + insert.length - 1,
				head: query.length + insert.length - 1
			},
			userEvent
		});
	}

	const filteredQualifierSuggestions = $derived(
		getFilteredQualifierSuggenstions(qualifierSuggestions, query, selection)
	);
</script>

<div role="row" class={['flex items-center text-sm', isFocusedRow(rowIndex) && 'bg-accent-50/75']}>
	<h2
		id="supersearch-add-qualifier-key-label"
		class="min-w-14 pr-1.5 pl-2 sm:min-w-auto sm:pr-3.5 sm:pl-4"
	>
		<!--
		<button
			type="button"
			tabindex="-1"
			class="cursor-default"
			onclick={() => searchContext.showExpandedSearch({ focusRow: rowIndex })}
			>
	-->
		{page.data.t('supersearch.addQualifiers')}
		<!-- </button> -->
	</h2>
	<ul
		class="scrollbar-hidden flex min-h-12 items-center gap-2 overflow-x-auto p-0.5"
		aria-labelledby="supersearch-add-qualifier-key-label"
	>
		{#each filteredQualifierSuggestions as { qualifier, replaceSelection }, cellIndex (qualifier.key)}
			<li>
				<button
					type="button"
					id={getCellId(rowIndex, cellIndex)}
					class={[
						'lxl-qualifier lxl-qualifier-key active:border-accent-400! active:bg-accent-200! first-letter:uppercase',
						isFocusedCell(rowIndex, cellIndex) && 'focused-cell'
					]}
					onclick={() => addQualifierKey(qualifier.key, replaceSelection)}
				>
					{qualifier.label}
				</button>
			</li>
		{/each}
		<li class="lxl-qualifier lxl-qualifier-key mr-2">
			<a href={resolve(page.data.localizeHref('/help/filters'))} class="flex items-center gap-0.5">
				{page.data.t('supersearch.moreQualifiers')}
				<IconMore class="text-link" />
			</a>
		</li>
	</ul>
</div>

<style lang="postcss">
	@reference 'tailwindcss';
	ul {
		& :global(.lxl-qualifier-key) {
			@apply rounded-md;
		}
		& :global(.lxl-qualifier-key),
		& :global(.atomic .lxl-qualifier-value) {
			&:hover {
				background-color: var(--color-accent-100);
			}
		}
	}
</style>
