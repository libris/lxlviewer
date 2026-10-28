import type { PropertyChain } from '#lib/types/search.js';
import {
	type Data,
	type FramedData,
	JsonLd,
	type Link,
	LxlJs,
	Owl,
	Platform,
	Rdfs
} from '#lib/types/xl.js';
import { asArray, isObject } from '#lib/utils/misc.js';
import { getUriSlug } from '#lib/utils/http.js';

const MERGES = 'ls:merges';
const CATEGORY = 'category';
const SEARCH_FILTER_CATEGORY = 'https://id.kb.se/vocab/searchfilter';
const MAX_DEPTH = 3;

export interface SearchPathContext {
	locale: string;
	getDefinition: (name: string | Link) => FramedData | undefined;
	chipLabel: (def: FramedData | undefined) => string;
	compactIri: (iri: string) => string;
}

type PathPart = { label: string; path: string };

export function resolveSearchPaths(
	def: FramedData | undefined,
	ctx: SearchPathContext,
	depth = 0
): PropertyChain[] {
	if (!def || depth > MAX_DEPTH) {
		return [];
	}

	if (hasCategory(def, Platform.composite)) {
		return dedupe([
			...chainsOf(def, ctx, depth),
			...subFiltersOf(def).flatMap((sub) => {
				const subLabel = ctx.chipLabel(sub);
				if (hasCategory(sub, SEARCH_FILTER_CATEGORY)) {
					const subKey = getUriSlug(sub[JsonLd.ID] as string) ?? '';
					return [{ key: subKey, label: subLabel || subKey, path: subKey }];
				}
				const entries = resolveSearchPaths(sub, ctx, depth + 1);
				if (!subLabel || entries.length !== 1 || entries[0].children?.length) {
					return entries;
				}
				return [{ ...entries[0], label: subLabel }];
			})
		]);
	}

	if (hasCategory(def, Platform.merged)) {
		return dedupe(
			mergeConstituents(def).flatMap((constituent) => {
				if (isLink(constituent)) {
					return resolveSearchPaths(ctx.getDefinition(constituent), ctx, depth + 1);
				}
				return isObject(constituent) ? chainsOf(constituent, ctx, depth + 1) : [];
			})
		);
	}

	const chains = chainsOf(def, ctx, depth);
	if (chains.length > 0) {
		return chains;
	}

	return [withOptionalLabel({ path: termKeyOf(def, ctx) }, def, ctx, depth)];
}

function withOptionalLabel(
	entry: PropertyChain,
	def: FramedData,
	ctx: SearchPathContext,
	depth: number
): PropertyChain {
	if (depth === 0) {
		return entry;
	}
	const label = ctx.chipLabel(def);
	return label ? { ...entry, label } : entry;
}

function chainsOf(def: Data, ctx: SearchPathContext, depth: number): PropertyChain[] {
	const chains: PropertyChain[] = [];
	for (const axiom of asArray<unknown>(def[Owl.PROPERTY_CHAIN_AXIOM] as unknown)) {
		if (!isObject(axiom)) {
			continue;
		}
		const list = axiom[JsonLd.LIST];
		if (Array.isArray(list)) {
			chains.push(...expandChain(list as unknown[], ctx, depth));
		}
	}
	return chains;
}

function expandChain(elements: unknown[], ctx: SearchPathContext, depth: number): PropertyChain[] {
	const alternatives = expandChainParts(elements, ctx, depth);
	if (alternatives.length <= 1) {
		return alternatives.map(toPropertyChain);
	}

	const prefix = commonPrefixParts(alternatives);
	if (prefix.length === 0) {
		return alternatives.map(toPropertyChain);
	}

	const children = alternatives
		.map((alternative) => toPropertyChain(alternative.slice(prefix.length)))
		.filter((child) => child.path);

	return children.length > 0 ? [{ ...toPropertyChain(prefix), children: dedupe(children) }] : [];
}

function commonPrefixParts(alternatives: PathPart[][]): PathPart[] {
	const first = alternatives[0];
	let length = 0;
	while (
		length < first.length &&
		alternatives.every((alternative) => samePart(alternative[length], first[length]))
	) {
		length++;
	}
	return first.slice(0, length);
}

function samePart(a: PathPart, b: PathPart): boolean {
	return a.path === b.path && a.label === b.label;
}

function toPropertyChain(parts: PathPart[]): PropertyChain {
	return {
		label: parts
			.map((p) => p.label)
			.filter(Boolean)
			.join(' › '),
		path: parts
			.map((p) => p.path)
			.filter(Boolean)
			.join('.')
	};
}

function expandChainParts(
	elements: unknown[],
	ctx: SearchPathContext,
	depth: number
): PathPart[][] {
	let alternatives: PathPart[][] = [[]];
	for (const element of elements) {
		const expanded = expandElement(element, ctx, depth);
		if (expanded.length === 0) {
			return [];
		}
		alternatives = alternatives.flatMap((prefix) => expanded.map((parts) => [...prefix, ...parts]));
	}
	return alternatives;
}

function expandElement(element: unknown, ctx: SearchPathContext, depth: number): PathPart[][] {
	if (isLink(element)) {
		const def = ctx.getDefinition(element);
		if (def && depth < MAX_DEPTH && hasCategory(def, Platform.merged)) {
			return mergeConstituents(def).flatMap((constituent) => {
				if (isLink(constituent)) {
					return expandElement(constituent, ctx, depth + 1);
				}
				return isObject(constituent) ? chainAxiomParts(constituent, ctx, depth + 1) : [];
			});
		}
		if (def && isRestrictedSubProperty(def)) {
			const restricted = formatRestrictedElement(def, ctx);
			if (restricted) {
				return [[restricted]];
			}
		}
		return [[partFor(element, ctx)]];
	}

	const restricted = isObject(element) ? formatRestrictedElement(element, ctx) : null;
	return restricted ? [[restricted]] : [];
}

function isRestrictedSubProperty(def: Data): boolean {
	if (!firstLink(def[Rdfs.subPropertyOf] as unknown)) {
		return false;
	}
	const range = firstOf(def[Rdfs.range] as unknown);
	return isObject(range) && hasRestriction(range);
}

function hasRestriction(range: Data): boolean {
	return asArray<unknown>(range[Rdfs.subClassOf] as unknown).some(
		(r) =>
			isObject(r) &&
			r[JsonLd.TYPE] === Owl.Restriction &&
			r[Owl.onProperty] !== undefined &&
			r[Owl.hasValue] !== undefined
	);
}

function chainAxiomParts(def: Data, ctx: SearchPathContext, depth: number): PathPart[][] {
	const parts: PathPart[][] = [];
	for (const axiom of asArray<unknown>(def[Owl.PROPERTY_CHAIN_AXIOM] as unknown)) {
		if (!isObject(axiom)) {
			continue;
		}
		const list = axiom[JsonLd.LIST];
		if (Array.isArray(list)) {
			parts.push(...expandChainParts(list as unknown[], ctx, depth));
		}
	}
	return parts;
}

function partFor(link: Link, ctx: SearchPathContext): PathPart {
	return {
		label: ctx.chipLabel(ctx.getDefinition(link)),
		path: termKeyOf(link, ctx)
	};
}

function termKeyOf(term: Link | FramedData, ctx: SearchPathContext): string {
	const iri = term[JsonLd.ID];
	return typeof iri === 'string' ? ctx.compactIri(iri) : '';
}

function formatRestrictedElement(el: Data, ctx: SearchPathContext): PathPart | null {
	const superProperty = firstLink(el[Rdfs.subPropertyOf] as unknown);
	if (!superProperty) {
		return null;
	}

	const superPath = termKeyOf(superProperty, ctx);
	const superLabel = ctx.chipLabel(ctx.getDefinition(superProperty)) || superPath;

	const range = firstOf(el[Rdfs.range] as unknown);
	if (range !== undefined) {
		return formatRangeRestricted(superPath, superLabel, range, ctx);
	}

	const domain = firstLink(el[Rdfs.domain] as unknown);
	if (domain) {
		const domainLabel = ctx.chipLabel(ctx.getDefinition(domain)) || termKeyOf(domain, ctx);
		return { label: `${superLabel} [${domainLabel}]`, path: superPath };
	}

	return { label: superLabel, path: superPath };
}

function formatRangeRestricted(
	superPath: string,
	superLabel: string,
	range: unknown,
	ctx: SearchPathContext
): PathPart | null {
	if (isLink(range)) {
		const valuePath = termKeyOf(range, ctx);
		const valueLabel = ctx.chipLabel(ctx.getDefinition(range)) || valuePath;
		return {
			label: `${superLabel} [${valueLabel}]`,
			path: `${superPath}[${valuePath}]`
		};
	}

	if (!isObject(range)) {
		return null;
	}

	let restriction: Data | undefined;
	for (const superClass of asArray<unknown>(range[Rdfs.subClassOf] as unknown)) {
		if (
			isObject(superClass) &&
			superClass[JsonLd.TYPE] === Owl.Restriction &&
			superClass[Owl.onProperty] &&
			superClass[Owl.hasValue] !== undefined
		) {
			restriction = superClass;
			break;
		}
	}
	if (!restriction) {
		return null;
	}

	const onProperty = firstLink(restriction[Owl.onProperty]);
	if (!onProperty) {
		return null;
	}

	const propertyPath = termKeyOf(onProperty, ctx);
	const propertyLabel = ctx.chipLabel(ctx.getDefinition(onProperty)) || propertyPath;
	const rawValue = restriction[Owl.hasValue];
	const valueLink = isLink(rawValue) ? rawValue : undefined;
	const valuePath = valueLink ? `<${termKeyOf(valueLink, ctx)}>` : String(rawValue);
	const valueLabel = valueLink
		? ctx.chipLabel(ctx.getDefinition(valueLink)) || termKeyOf(valueLink, ctx)
		: String(rawValue);

	return {
		label: `${superLabel} [${propertyLabel}: ${valueLabel}]`,
		path: `${superPath}[${propertyPath}=${valuePath}]`
	};
}

function mergeConstituents(def: FramedData): unknown[] {
	return asArray<unknown>(def[MERGES] as unknown);
}

function subFiltersOf(def: FramedData): Data[] {
	const subs: Data[] = [];
	for (const sub of asArray<unknown>(def[LxlJs.BASE_PROPERTY_OF] as unknown)) {
		if (isObject(sub)) {
			subs.push(sub);
		}
	}
	return subs;
}

function hasCategory(def: FramedData, categoryIri: string): boolean {
	return asArray<unknown>(def[CATEGORY] as unknown).some(
		(c) => isObject(c) && typeof c[JsonLd.ID] === 'string' && c[JsonLd.ID] === categoryIri
	);
}

function firstLink(value: unknown): Link | undefined {
	for (const item of asArray<unknown>(value)) {
		if (isLink(item)) {
			return item;
		}
	}
	return undefined;
}

function firstOf(value: unknown): unknown {
	return asArray(value)[0];
}

function isLink(data: unknown): data is Link {
	return isObject(data) && typeof data[JsonLd.ID] === 'string';
}

function dedupe(paths: PropertyChain[]): PropertyChain[] {
	const byPath = new Map<string, PropertyChain>();
	const ordered: PropertyChain[] = [];
	for (const p of paths) {
		if (!p.path) {
			continue;
		}
		const existing = byPath.get(p.path);
		if (!existing) {
			byPath.set(p.path, p);
			ordered.push(p);
		} else if (p.children?.length) {
			existing.children = dedupe([...(existing.children ?? []), ...p.children]);
		}
	}
	return ordered;
}
