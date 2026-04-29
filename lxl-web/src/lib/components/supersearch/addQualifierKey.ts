import { env } from '$env/dynamic/public';
import { lxlQuery } from 'codemirror-lang-lxlquery';
import { type SearchContext } from '$lib/contexts/search';

function debugLog(message: unknown) {
	if (env.PUBLIC_DEBUG_SUPERSEARCH && env.PUBLIC_DEBUG_SUPERSEARCH.toLowerCase() === 'true') {
		console.log('DEBUG ADD QUALIFIER KEY:', (message as object).toString());
	}
}

export function addQualifierKey(searchContext: SearchContext, qualifierKey: string) {
	const userEvent = 'input.complete';
	const query = searchContext.getQuery();
	const selection = searchContext.getSelection();

	searchContext.showExpandedSearch(); // keep dialog open (since 'regular' search is hidden on mobile)

	if (selection) {
		const tree = lxlQuery.language.parser.parse(query);
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
				(hasCharBefore ? ' ' : '') + `${qualifierKey}:(${slicedValue})` + (hasCharAfter ? ' ' : '');
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
			const insert = ` ${qualifierKey}:() `;
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

	/*
		if (qualifierSuggestionNeedle.word.length > 0) {
			// TODO don't need this if we can check qualifier editing state?
			// TODO don't suggest same
			// TODO handle replacement of qualifier more smoothly
			const insert = [':', '=', '<', '>'].includes(q.charAt(qualifierSuggestionNeedle.to))
				? qualifierKey
				: `${qualifierKey}:`;

			superSearch?.dispatchChange({
				change: {
					from: qualifierSuggestionNeedle.from,
					to: qualifierSuggestionNeedle.to,
					insert
				},
				selection: {
					anchor: qualifierSuggestionNeedle.from + insert.length,
					head: qualifierSuggestionNeedle.from + insert.length
				},
				userEvent: 'input.complete'
			});
		} else {
			const insert = `${qualifierKey}:`;

			superSearch?.dispatchChange({
				change: {
					from: cursor,
					to: cursor,
					insert
				},
				selection: {
					anchor: cursor + insert.length,
					head: cursor + insert.length
				},
				userEvent: 'input.complete'
			});
		}
			*/
}

export default addQualifierKey;
