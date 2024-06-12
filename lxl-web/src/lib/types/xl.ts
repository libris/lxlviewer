// TODO type for JSON-LD structure

export enum JsonLd {
	BASE = '@base',
	CONTAINER = '@container',
	CONTEXT = '@context',
	GRAPH = '@graph',
	ID = '@id',
	LANGUAGE = '@language',
	LIST = '@list',
	REVERSE = '@reverse',
	SET = '@set',
	TYPE = '@type',
	VALUE = '@value',
	VOCAB = '@vocab'
}

export enum Owl {
	SAME_AS = 'sameAs'
}

export enum Fmt {
	DISPLAY = '_display',
	PROPS = '_props',
	CONTENT_AFTER = '_contentAfter',
	CONTENT_BEFORE = '_contentBefore',
	STYLE = '_style',
	LABEL = '_label'
}

// https://github.com/libris/definitions/blob/develop/source/vocab/base.ttl
export enum Base {
	StructuredValue = 'StructuredValue'
}

// https://github.com/libris/definitions/blob/develop/source/vocab/platform.ttl
export enum Platform {
	integral = 'integral',
	meta = 'meta'
}

export type ClassName = string;
export type PropertyName = string;
export type LangCode = string;

// https://github.com/libris/definitions/blob/develop/source/vocab/display.jsonld
export interface DisplayJsonLd {
	[JsonLd.CONTEXT]: Context;
	[JsonLd.GRAPH]: unknown;
	lensGroups: Record<LensType, LensGroup>;
	formatters: Record<ClassName, Format>;
}

export type LangContainer = Record<LangCode, string | string[]>;

// https://www.w3.org/2005/04/fresnel-info/manual/
export enum Fresnel {
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

export interface Format {
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

export interface FormatDetails {
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

export type RangeRestriction = { subPropertyOf: PropertyName; range: ClassName };
export type AlternateProperties = { alternateProperties: (PropertyName | RangeRestriction)[] };
export type ShowProperty =
	| PropertyName
	| Fresnel.super
	| AlternateProperties
	| { inverse: PropertyName };
export type ShowProperties = ShowProperty[];

export interface Lens {
	[JsonLd.ID]?: string;
	[JsonLd.TYPE]: Fresnel.Lens;
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
	WebChip = 'web-chips',
	WebCard = 'web-card',
	WebCardFooter = 'web-card-footer',
	WebCardHeaderExtra = 'web-card-header-extra',
	None = null // FIXME
}

export type DerivedLensType = string;

export interface DerivedLensTypeDefinition {
	name: DerivedLensType;
	// use the first of these found as the base
	base: LensType[];
	// remove all showProperties from the first of these that is found
	minusFirst: LensType[];
	// remove all showProperties from these
	minusAll: LensType[];
}

type Context = Record<string, string | Record<JsonLd, string>>;

// TODO
export type Data = Record<string, unknown>;
export type FramedData = Record<string, unknown>;

export type PropertyDefinition = unknown;

// TODO
export interface LensedOrdered {
	[JsonLd.ID]?: Link;
	[JsonLd.TYPE]: ClassName;
	[Fmt.PROPS]: LensedOrdered[];
}
export type DisplayDecorated = unknown;

export interface VocabData {
	'@context'?: string | Context;
	'@graph': Record<string, unknown>[];
}

export interface ContextData {
	'@context': Context;
	'@graph': Record<string, unknown>[];
}
