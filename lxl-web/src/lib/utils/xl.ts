import * as lxljsVocab from 'lxljs/vocab';

// TODO TESTS!
// TODO type for JSON-LD structure

export enum JsonLd {
	BASE = '@base',
	CONTAINER = '@container',
	CONTEXT = '@context',
	GRAPH = '@graph',
	ID = '@id',
	LANGUAGE = '@language',
	LIST = '@list',
	SET = '@set',
	TYPE = '@type',
	VALUE = '@value',
	VOCAB = '@vocab'
}

enum Fmt {
	DISPLAY = '_display',
	PROPS = '_props',
	CONTENT_AFTER = '_contentAfter',
	CONTENT_BEFORE = '_contentBefore',
	STYLE = '_style'
}

enum Base {
	StructuredValue = 'StructuredValue'
}

enum Platform {
	integral = 'integral'
}

type ClassName = string;
export type PropertyName = string;
export type LangCode = string;

interface DisplayJsonLd {
	[JsonLd.CONTEXT]: Context;
	[JsonLd.GRAPH]: unknown;
	lensGroups: Record<LensType, LensGroup>;
	formatters: Record<ClassName, Format>;
}

type LangContainer = Record<LangCode, string | string[]>;

enum Fresnel {
	Format = 'fresnel:Format',
	Group = 'fresnel:Group',
	Lens = 'fresnel:Lens',
	classFormatDomain = 'fresnel:classFormatDomain',
	contentAfter = 'fresnel:contentAfter',
	contentBefore = 'fresnel:contentBefore',
	contentFirst = 'fresnel:contentFirst',
	contentLast = 'fresnel:contentLast',
	extends = 'fresnel:extends',
	group = 'fresnel:group',
	propertyFormat = 'fresnel:propertyFormat',
	propertyFormatDomain = 'fresnel:propertyFormatDomain',
	propertyStyle = 'fresnel:propertyStyle',
	resourceFormat = 'fresnel:resourceFormat',
	resourceStyle = 'fresnel:resourceStyle',
	super = 'fresnel:super',
	valueFormat = 'fresnel:valueFormat',
	valueStyle = 'fresnel:valueStyle'
}

interface Format {
	[JsonLd.ID]?: string;
	[JsonLd.TYPE]?: Fresnel.Format;
	[Fresnel.group]?: string;
	[Fresnel.classFormatDomain]?: [ClassName];
	[Fresnel.propertyFormatDomain]?: [PropertyName];
	[Fresnel.propertyFormat]?: FormatDetails;
	[Fresnel.resourceFormat]: FormatDetails;
	[Fresnel.valueFormat]?: FormatDetails;
	[Fresnel.propertyStyle]?: string[];
	[Fresnel.resourceStyle]?: string[];
	[Fresnel.valueStyle]?: string[];
}

interface FormatDetails {
	[Fresnel.contentBefore]?: string;
	[Fresnel.contentAfter]?: string;
	[Fresnel.contentFirst]?: string;
	[Fresnel.contentLast]?: string;
}

interface LensGroup {
	[JsonLd.ID]?: string;
	[JsonLd.TYPE]: Fresnel.Group;
	lenses: Record<ClassName, Lens>;
	[Fresnel.classFormatDomain]?: [ClassName];
}

export interface Link {
	'@id': string;
}

type RangeRestriction = { subPropertyOf: PropertyName; range: ClassName };
type AlternateProperties = { alternateProperties: (PropertyName | RangeRestriction)[] };
type ShowProperty = PropertyName | Fresnel.super | AlternateProperties | { inverse: PropertyName };
type ShowProperties = ShowProperty[];

interface Lens {
	'@id'?: string;
	'@type': Fresnel.Lens;
	classLensDomain?: ClassName;
	[Fresnel.extends]?: Link;
	[Fresnel.group]?: string;
	showProperties: ShowProperties;
}

export enum LensType {
	Token = 'tokens',
	Chip = 'chips',
	Card = 'cards',
	Full = 'full',
	SearchChip = 'search-chips',
	SearchCard = 'search-cards',
	WebChip = 'web-chips'
}

type Context = Record<string, string | Record<JsonLd, string>>;

// TODO
type Data = Record<string, unknown>;
export type FramedData = Record<string, unknown>;

export type PropertyDefinition = unknown;

// TODO
type LensedOrdered = unknown;
export type DisplayDecorated = unknown;

interface VocabData {
	'@context'?: string | Context;
	'@graph': Record<string, unknown>[];
}

interface ContextData {
	'@context': Context;
	'@graph': Record<string, unknown>[];
}

export class VocabUtil {
	//vocabId: string
	vocabIndex: Map;
	context;

	constructor(vocab: VocabData, context: ContextData) {
		this.context = lxljsVocab.preprocessContext(context)[JsonLd.CONTEXT];
		this.vocabIndex = lxljsVocab.preprocessVocab(vocab);
	}

	getBaseClasses(className: ClassName | ClassName[]): ClassName[] {
		//FIXME? if multiple base classes, base classes are returned in depth-first order instead of breadth-first
		return Array.isArray(className)
			? className.map((c) => lxljsVocab.getBaseClasses(c, this.vocabIndex, this.context)).flat()
			: lxljsVocab.getBaseClasses(className, this.vocabIndex, this.context);
	}

	// TODO handle missing type
	getType(thing: Data): ClassName {
		return thing[JsonLd.TYPE] as ClassName;
	}

	isSubClassOf(className: ClassName, baseClassName: ClassName) {
		this.getBaseClasses(className).includes(baseClassName);
	}

	isStructuredValue(className: ClassName) {
		return this.isSubClassOf(className, Base.StructuredValue);
	}

	// TODO? reimplement?
	hasCategory(propertyName: PropertyName, category: string) {
		return lxljsVocab.hasCategory(propertyName, category, {
			vocab: this.vocabIndex,
			context: this.context
		});
	}
}

type FormatIndex = Record<string, Format>;

// TODO transliterated values in language containers
// TODO handle not framed data, i.e. @graph
// TODO type coercion (code, langCode, langCodeFull -> code^^ISO639-2, code^^ISO639-3 etc.)
// TODO fresnel:allProperties?
export class DisplayUtil {
	private readonly display: DisplayJsonLd;
	private readonly vocabUtil: VocabUtil;

	// TODO
	private readonly DEFAULT_LENS: Lens = {
		[JsonLd.TYPE]: Fresnel.Lens,
		showProperties: [{ alternateProperties: ['prefLabel', 'label', 'name', '@id'] }]
	};

	// TODO category integral should remain on same level?
	private readonly DEFAULT_SUBLENS_SELECTOR = (lensType: LensType, propertyName: PropertyName) => {
		if (this.vocabUtil.hasCategory(propertyName, Platform.integral)) {
			return lensType;
		}

		switch (lensType) {
			case LensType.Full:
				return LensType.Card;
			case LensType.Card:
			case LensType.SearchCard:
				return LensType.Chip;
			case LensType.Chip:
			case LensType.SearchChip:
			case LensType.Token:
				return LensType.Token;
		}
	};

	// x -> xByLang
	langContainerAlias: Record<PropertyName, PropertyName> = {};
	// xByLang -> x
	langContainerAliasInverted: Record<PropertyName, PropertyName> = {};

	private readonly formatIndex: FormatIndex;

	constructor(display: DisplayJsonLd, vocabUtil: VocabUtil) {
		this.display = display;
		this.vocabUtil = vocabUtil;
		this.buildLangContainerAliasMap();
		this.expandInheritedLensProperties();

		this.formatIndex = buildFormatIndex(this.display);
		console.log('Initialized DisplayUtil');
	}

	applyLens(thing: FramedData, lensType: LensType) {
		return this._applyLens(
			thing,
			lensType,
			this.DEFAULT_SUBLENS_SELECTOR,
			(result, p, value) => {
				(result as Data)[p] = value;
			},
			() => {
				return {};
			}
		);
	}

	applyLensOrdered(thing: FramedData, lensType: LensType): LensedOrdered {
		return this._applyLens(
			thing,
			lensType,
			this.DEFAULT_SUBLENS_SELECTOR,
			(result, p, value) => {
				[JsonLd.ID, JsonLd.TYPE].includes(p)
					? ((result as Record<string, unknown>)[p] = value)
					: (result as { _props: Array<Data> })._props.push({ [p]: value });
			},
			() => {
				return { _props: [] };
			}
		);
	}

	lensAndFormat(thing: FramedData, lensType: LensType, locale: LangCode): DisplayDecorated {
		return this.format(this.applyLensOrdered(thing, lensType), locale);
	}

	format(thing: LensedOrdered, locale: LangCode): DisplayDecorated {
		return new Formatter(this, this.vocabUtil, this.formatIndex, locale).displayDecorate(thing);
	}

	/*
	applyLensOrdered(thing: FramedData, lensType: LensType) {
		return this._applyLens(
			thing,
			lensType,
			(result, p, value) => {
				(result as Array<Data>).push({ [p]: value });
			},
			() => {
				return [];
			}
		);
	}
	 */

	private _applyLens(
		thing: unknown,
		lensType: LensType,
		subLensSelector: (lensType: LensType, propertyName: PropertyName) => LensType,
		ack: (result: unknown, p: PropertyName, value: unknown) => void,
		ackInit: () => unknown
	) {
		if (!isTypedNode(thing)) {
			return thing;
		}

		const lens = this.findLens(lensType, this.vocabUtil.getType(thing));
		const result = ackInit();

		const has = (src: Data, key: string): boolean => {
			return key in src || (key in this.langContainerAlias && this.langContainerAlias[key] in src);
		};

		const accumulate = (src: Data, key: string) => {
			const value = Array.isArray(src[key])
				? (src[key] as Array<unknown>).map((v) =>
						this._applyLens(v, subLensSelector(lensType, key), subLensSelector, ack, ackInit)
					)
				: this._applyLens(src[key], subLensSelector(lensType, key), subLensSelector, ack, ackInit);
			ack(result, key, value);
		};

		const pick = (src: Data, key: string) => {
			if (key in src) {
				accumulate(src, key);
			}
			if (key in this.langContainerAlias) {
				const alias = this.langContainerAlias[key];
				if (alias in src) {
					accumulate(src, alias);
				}
			}
		};

		for (const p of [JsonLd.TYPE, JsonLd.ID, ...lens.showProperties]) {
			if (isAlternateProperties(p)) {
				for (const alternative of p.alternateProperties) {
					if (isRangeRestriction(alternative)) {
						// can never be language container
						const k = alternative.subPropertyOf;
						const v = thing[k];
						if (isTypedNode(v) && v[JsonLd.TYPE] === alternative.range) {
							pick(thing, k);
							break;
						}
					} else {
						if (has(thing, alternative)) {
							pick(thing, alternative);
							break;
						}
					}
				}
			} else if (isInverseProperty(p)) {
				// TODO
			} else {
				if (has(thing, p)) {
					pick(thing, p);
				}
			}
		}

		return result;
	}

	private findLens(lens: LensType, className: ClassName) {
		for (const cls of [className, ...this.vocabUtil.getBaseClasses(className)]) {
			if (cls in this.display.lensGroups[lens].lenses) {
				return this.display.lensGroups[lens].lenses[cls];
			}
		}

		// TODO... decide what we want
		if (lens == LensType.Token) {
			for (const cls of [className, ...this.vocabUtil.getBaseClasses(className)]) {
				if (cls in this.display.lensGroups[LensType.Chip].lenses) {
					return this.display.lensGroups[LensType.Chip].lenses[cls];
				}
			}
		}

		return this.DEFAULT_LENS;
	}

	_getFormatIndex() {
		return this.formatIndex;
	}

	private buildLangContainerAliasMap() {
		for (const [k, v] of Object.entries({
			...this.vocabUtil.context,
			...this.display[JsonLd.CONTEXT]
		})) {
			// TODO why null check?
			if (v && isLangContainerDefinition(v as Record<string, string>)) {
				this.langContainerAlias[(v as Record<string, string>)[JsonLd.ID]] = k;
			}
		}

		this.langContainerAliasInverted = invertRecord(this.langContainerAlias);
	}

	private expandInheritedLensProperties() {
		const lensesById: Record<string, Lens> = {};
		this.eachLens((lens) => {
			if (lens[JsonLd.ID]) {
				lensesById[lens[JsonLd.ID]] = lens;
			}
		});

		const flattenedProps = (lens: Lens, hierarchy: string[]): ShowProperties => {
			if (lens[JsonLd.ID] && hierarchy.includes(lens[JsonLd.ID])) {
				throw Error(`${Fresnel.extends} inheritance loop: ${hierarchy}`);
			}

			const superLensId = lens[Fresnel.extends]?.[JsonLd.ID];
			if (!superLensId) {
				return lens.showProperties;
			} else {
				if (!lensesById[superLensId]) {
					throw Error(`Super lens not found: ${lens[JsonLd.ID]} ${Fresnel.extends} ${superLensId}`);
				}

				if (lens['@id']) {
					hierarchy.push(lens[JsonLd.ID]!);
				}
				const superProps = flattenedProps(lensesById[superLensId], hierarchy);
				let props = lens.showProperties;
				if (!props.includes(Fresnel.super)) {
					props = ([Fresnel.super] as ShowProperties).concat(props);
				}
				return props.map((p) => (p === Fresnel.super ? superProps : p)).flat();
			}
		};

		this.eachLens((lens) => {
			lens.showProperties = flattenedProps(lens, []);
			delete lens[Fresnel.extends];
		});
	}

	private eachLens(fn: (a: Lens) => void) {
		const groups = Object.values(this.display.lensGroups).filter(
			(g) => g[JsonLd.TYPE] === Fresnel.Group
		); // TODO until "formatters" is moved
		const lenses = groups.map((g) => Object.values(g.lenses)).flat();
		for (const lens of lenses) {
			fn(lens);
		}
	}
}

type Styler = (v: unknown) => unknown;

class Formatter {
	private readonly DEFAULT_FORMAT: Format = {
		[JsonLd.TYPE]: Fresnel.Format,
		[Fresnel.propertyFormat]: {},
		[Fresnel.valueFormat]: {},
		[Fresnel.resourceFormat]: {}
	};

	private readonly stylers: Record<string, Styler> = {
		'isniGroupDigits()': (v) => {
			const formatIsni = (isni: unknown) =>
				typeof isni === 'string' && isni.length === 16
					? `${isni.slice(0, 4)} ${isni.slice(4, 8)} ${isni.slice(8, 12)} ${isni.slice(12, 16)}`
					: isni;

			return Array.isArray(v) ? v.map(formatIsni) : formatIsni(v);
		},
		'displayType()': (v) => {
			if (isObject(v) && JsonLd.TYPE in v && Fmt.DISPLAY in v) {
				// TODO doesn't translate type name
				(v[Fmt.DISPLAY] as Array<unknown>).unshift({ [JsonLd.VALUE]: v[JsonLd.TYPE] });
			}
			return v;
		}
	};

	private readonly formatIndex: FormatIndex;
	private readonly locale: LangCode;
	private readonly displayUtil: DisplayUtil;
	private readonly vocabUtil: VocabUtil;

	constructor(
		displayUtil: DisplayUtil,
		vocabUtil: VocabUtil,
		formatIndex: FormatIndex,
		locale: LangCode
	) {
		this.displayUtil = displayUtil;
		this.vocabUtil = vocabUtil;
		this.formatIndex = formatIndex;
		this.locale = locale;
	}

	displayDecorate(thing: LensedOrdered) {
		if (!isTypedNode(thing)) {
			return thing;
		}

		return this.formatResource(thing, false, false);
	}

	private formatResource(resource, isFirst: boolean, isLast: boolean) {
		const className = resource[JsonLd.TYPE];
		let result = {
			...(JsonLd.ID in resource && { [JsonLd.ID]: resource[JsonLd.ID] }),
			[JsonLd.TYPE]: className,
			[Fmt.DISPLAY]: this.formatProperties(resource[Fmt.PROPS], className)
		};
		result = this.styleResource(result, className);
		this.addFormatDetail(result, this.findResourceFormat(className), isFirst, isLast);

		return result;
	}

	private formatProperties(properties, className: ClassName) {
		return asArray(properties).map((p, ix, a) => {
			return this.formatProperty(p, className, ix == 0, 1 == a.length);
		});
	}

	private formatProperty(property, className: ClassName, isFirst: boolean, isLast: boolean) {
		const propertyName = Object.keys(property)[0];
		const value = Object.values(property)[0];

		// FIXME reaching inside
		if (this.displayUtil.langContainerAliasInverted[propertyName]) {
			return {
				[this.displayUtil.langContainerAliasInverted[propertyName]]: this.pickLanguage(value)
			};
		}

		let result = {} as Record<string, unknown>;
		result = this.styleProperty(result, className, propertyName);
		this.addFormatDetail(result, this.findPropertyFormat(className, propertyName), isFirst, isLast);

		result[propertyName] = this.formatValues(value, className, propertyName);

		return result;
	}

	private formatValues(values, className: ClassName, propertyName: PropertyName) {
		values = unwrapSingle(values);
		if (Array.isArray(values)) {
			return values.map((v, ix, a) => {
				return this.formatValueInArray(v, className, propertyName, ix == 0, ix + 1 == a.length);
			});
		} else {
			return this.formatSingleValue(values, className, propertyName);
		}
	}

	private formatSingleValue(value, className: ClassName, propertyName: PropertyName) {
		if (isTypedNode(value)) {
			const result = this.formatResource(value, true, true);
			this.addFormatDetail(result, this.findValueFormat(className, propertyName), true, true);
			return result;
		} else {
			return this.styleValue(value, className, propertyName);
		}
	}

	private formatValueInArray(
		value,
		className: ClassName,
		propertyName: PropertyName,
		isFirst: boolean,
		isLast: boolean
	) {
		let result;
		if (isTypedNode(value)) {
			result = this.formatResource(value, isFirst, isLast);
		} else {
			result = { [JsonLd.VALUE]: this.styleValue(value, className, propertyName) };
		}
		this.addFormatDetail(result, this.findValueFormat(className, propertyName), isFirst, isLast);
		return result;
	}

	private styleProperty(property, className: ClassName, propertyName: PropertyName) {
		this.findPropertyStyle(className, propertyName).forEach((style) => {
			if (style in this.stylers) {
				property = this.stylers[style](property);
			} else {
				property[Fmt.STYLE] = property[Fmt.STYLE] || [];
				property[Fmt.STYLE].push(style);
			}
		});
		return property;
	}

	private styleResource(resource, className: ClassName) {
		this.findResourceStyle(className).forEach((style) => {
			if (style in this.stylers) {
				resource = this.stylers[style](resource);
			} else {
				resource[Fmt.STYLE] = resource[Fmt.STYLE] || [];
				resource[Fmt.STYLE].push(style);
			}
		});
		return resource;
	}

	private styleValue(value, className: ClassName, propertyName: PropertyName) {
		this.findValueStyle(className, propertyName).forEach((style) => {
			if (style in this.stylers) {
				value = this.stylers[style](value);
			}
		});
		return value;
	}

	private addFormatDetail(
		obj: Record<string, unknown>,
		details: FormatDetails,
		isFirst: boolean,
		isLast: boolean
	) {
		if (isFirst && Fresnel.contentFirst in details) {
			if (details[Fresnel.contentFirst] !== '') {
				// TODO decide if we should generate contentBefore or contentFirst here
				obj[Fmt.CONTENT_BEFORE] = details[Fresnel.contentFirst];
			}
		} else if (Fresnel.contentBefore in details && details[Fresnel.contentBefore] !== '') {
			obj[Fmt.CONTENT_BEFORE] = details[Fresnel.contentBefore];
		}

		if (isLast && Fresnel.contentLast in details) {
			if (details[Fresnel.contentLast] !== '') {
				// TODO decide if we should generate contentAfter or contentLast here
				obj[Fmt.CONTENT_AFTER] = details[Fresnel.contentLast];
			}
		} else if (Fresnel.contentAfter in details && details[Fresnel.contentAfter] !== '') {
			obj[Fmt.CONTENT_AFTER] = details[Fresnel.contentAfter];
		}
	}

	private findResourceFormat(className: ClassName): FormatDetails {
		return this._findResourceFormat(className, Fresnel.resourceFormat)[Fresnel.resourceFormat]!;
	}

	private findResourceStyle(className: ClassName): string[] {
		return this._findResourceFormat(className, Fresnel.resourceStyle)[Fresnel.resourceStyle] || [];
	}

	private findPropertyFormat(className: ClassName, propertyName: PropertyName): FormatDetails {
		const f = this._findPropertyOrValueFormat(className, propertyName, Fresnel.propertyFormat);
		return f[Fresnel.propertyFormat]!;
	}

	private findPropertyStyle(className: ClassName, propertyName: PropertyName): string[] {
		const f = this._findPropertyOrValueFormat(className, propertyName, Fresnel.propertyStyle);
		return f[Fresnel.propertyStyle] || [];
	}

	private findValueFormat(className: ClassName, propertyName: PropertyName): FormatDetails {
		const f = this._findPropertyOrValueFormat(className, propertyName, Fresnel.valueFormat);
		return f[Fresnel.valueFormat]!;
	}

	private findValueStyle(className: ClassName, propertyName: PropertyName): string[] {
		const f = this._findPropertyOrValueFormat(className, propertyName, Fresnel.valueStyle);
		return f[Fresnel.valueStyle] || [];
	}

	private _findResourceFormat(
		className: ClassName,
		key: Fresnel.resourceFormat | Fresnel.resourceStyle
	) {
		for (const cls of [className, ...this.vocabUtil.getBaseClasses(className)]) {
			const hasFormat = (f: Format) => key in f;
			if (cls in this.formatIndex && hasFormat(this.formatIndex[cls])) {
				return this.formatIndex[cls];
			}
		}
		return this.DEFAULT_FORMAT;
	}

	private _findPropertyOrValueFormat(
		className: ClassName,
		propertyName: PropertyName,
		key: Fresnel.propertyFormat | Fresnel.propertyStyle | Fresnel.valueFormat | Fresnel.valueStyle
	) {
		// TODO precompute / memoize formats for base classes
		const hasFormat = (f: Format) => key in f;
		for (const cls of [className, ...this.vocabUtil.getBaseClasses(className)]) {
			const ix = `${cls}/${propertyName}`;
			if (ix in this.formatIndex && hasFormat(this.formatIndex[ix])) {
				console.debug(`${ix} -> ${this.formatIndex[ix]}`);
				return this.formatIndex[ix];
			}
		}
		if (propertyName in this.formatIndex && hasFormat(this.formatIndex[propertyName])) {
			console.debug(`${className} ${propertyName} ${key} -> ${this.formatIndex[propertyName]}`);
			return this.formatIndex[propertyName];
		}
		for (const cls of [className, ...this.vocabUtil.getBaseClasses(className)]) {
			const ix = `${cls}/*`;
			if (ix in this.formatIndex && hasFormat(this.formatIndex[ix])) {
				return this.formatIndex[ix];
			}
		}
		return this.DEFAULT_FORMAT;
	}

	private pickLanguage(container: LangContainer) {
		// TODO handle missing
		return container[this.locale];
	}
}

function buildFormatIndex(display: DisplayJsonLd) {
	if (!display.formatters) {
		return {};
	}

	const formatIndex: FormatIndex = {};

	Object.entries(display.formatters).forEach(([key, format]) => {
		if (key !== format[JsonLd.ID]) {
			console.warn(
				`Mismatch in ${Fresnel.Format} identifiers: key ${key} @id ${format[JsonLd.ID]}`
			);
		}
		const classDomain = asArray(format[Fresnel.classFormatDomain]);
		const propertyDomain = asArray(format[Fresnel.propertyFormatDomain]);
		if (Fresnel.resourceFormat in format && !classDomain.length) {
			console.warn(`${Fresnel.resourceFormat} without ${Fresnel.classFormatDomain}: ${key}`);
		}
		if (Fresnel.propertyFormat in format && !propertyDomain.length) {
			console.warn(`${Fresnel.propertyFormat} without ${Fresnel.propertyFormatDomain}: ${key}`);
		}
		if (Fresnel.valueFormat in format && !propertyDomain.length) {
			console.warn(`${Fresnel.valueFormat} without ${Fresnel.propertyFormatDomain}: ${key}`);
		}

		if (classDomain.length && propertyDomain.length) {
			classDomain.forEach((c) =>
				propertyDomain.forEach((p) => {
					formatIndex[`${c}/${p}`] = format;
				})
			);
		} else if (classDomain.length) {
			classDomain.forEach((c) => {
				formatIndex[`${c}`] = format;
			});
		} else if (propertyDomain.length) {
			propertyDomain.forEach((p) => {
				formatIndex[`${p}`] = format;
			});
		}
	});

	return formatIndex;
}

function invertRecord<K extends string | number | symbol, V extends string | number | symbol>(
	obj: Record<K, V>
): Record<V, K> {
	return Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));
}

/*
export function mapValuesOfObject<V, V2>(obj: Record<string, V>, fn: (v: V, k: string, i: number) => V2): Record<string, V2> {
    return Object.fromEntries(
        Object.entries(obj).map(
            ([k, v], i) => [k, fn(v, k, i)]
        )
    )
}

 */

function isAlternateProperties(v: ShowProperty): v is AlternateProperties {
	return typeof v !== 'string' && 'alternateProperties' in v;
}

function isInverseProperty(v: ShowProperty): v is { inverse: PropertyName } {
	return typeof v !== 'string' && 'inverse' in v;
}

function isRangeRestriction(v: PropertyName | RangeRestriction): v is RangeRestriction {
	return typeof v !== 'string' && 'subPropertyOf' in v && 'range' in v;
}

// TODO...
function isTypedNode(data: unknown): data is Data {
	return isObject(data) && JsonLd.TYPE in data;
}

function asArray(v: unknown): Array<unknown> {
	return Array.isArray(v) ? v : v === null || v === undefined ? [] : [v];
}

function unwrapSingle(v: unknown) {
	return Array.isArray(v) ? (v.length == 1 ? v[0] : v) : v;
}

/*
function isLink(data: unknown): data is Link {
	return isObject(data)
		&& Object.keys(data).length === 1
		&& Key.ID in data;
}
 */

export function isObject(data: unknown): data is Data {
	return typeof data === 'object' && !Array.isArray(data) && data !== null;
}

function isLangContainerDefinition(dfn: Record<string, string>) {
	return dfn[JsonLd.CONTAINER] == JsonLd.LANGUAGE;
}
