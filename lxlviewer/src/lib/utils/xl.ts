
enum Key {
    BASE = '@base',
    CONTAINER = '@container',
    CONTEXT = '@context',
    GRAPH = '@graph',
    ID = '@id',
    LANGUAGE = '@language',
    LIST = '@list',
    SET = '@set',
    TYPE = '@type',
    VOCAB = '@vocab',
}

/*
function isSetContainer(dfn: Record<string, string>) {
    return dfn[CONTAINER_KEY] == SET_KEY
}

function isListContainer(dfn: Record<string, string>) {
    return dfn[CONTAINER_KEY] == LIST_KEY
}
*/

function isLangContainer(dfn: Record<string, string>) {
    return dfn[Key.CONTAINER] == Key.LANGUAGE
}

type AlternateProperties = {
    alternateProperties: (PropertyName | { subPropertyOf: PropertyName; range: ClassName })[]
}

type ClassName = string;
type PropertyName = string;

interface DisplayJsonLd {
    '@context'?: any
    '@graph'?: any
    lensGroups: Record<LensType, LensGroup>
    groups: Record<string, Group>
    formatters: Record<ClassName, Format>
}

interface Format {
    '@id'?: string
    '@type': "fresnel:Format"
    'fresnel:group'?: string
    'fresnel:classFormatDomain'?: [ClassName]
    'fresnel:propertyFormatDomain'?: [PropertyName]
    'fresnel:propertyFormat'?: FormatDetails
    'fresnel:valueFormat'?: FormatDetails
    'fresnel:propertyStyle'?: string
}

interface FormatDetails {
    'fresnel:contentBefore'?: string
    'fresnel:contentAfter'?: string
    'fresnel:contentFirst'?: string
    'fresnel:contentLast'?: string
}

//TODO: these are different. because we know the main LensGroup always contains lenses
interface Group {
    '@id'?: string
    '@type': "fresnel:Group"
    lenses?: Record<ClassName, Lens>
    'fresnel:classFormatDomain'?: [ClassName]
}

interface LensGroup {
    '@id'?: string
    '@type': "fresnel:Group"
    lenses: Record<ClassName, Lens>
    'fresnel:classFormatDomain'?: [ClassName]
}

interface Link {
    '@id': string
}

type ShowProperties = (PropertyName | "fresnel:super" | AlternateProperties | { inverseOf: PropertyName})[]

interface Lens {
    '@id'?: string
    '@type': "fresnel:Lens"
    classLensDomain?: ClassName
    'fresnel:extends'?: Link
    'fresnel:group'?: string
    showProperties: ShowProperties
}

export enum LensType {
    Token = "token",
    Chip = "chip",
    Card = "card",
    Full = "full",
    SearchChip = "search-chips",
    SearchCard = "search-cards",
}

type Context = Record<string, string | Record<Key, string> >

interface VocabData {
    '@context'?: string | Context
    '@graph': Record<string, unknown>[]
}

interface ContextData {
    '@context': Context
    '@graph': Record<string, unknown>[]
}

export class VocabUtil {
    vocabId: string
    vocabIndex
    context

    constructor(vocab: VocabData, context: ContextData) {

        //this.vocab = vocab
        this.context = context
        this.vocabId = context[Key.VOCAB]
        this.vocabIndex = preprocessVocab(vocab)
    }

}

export class DisplayUtil {
    private readonly display: DisplayJsonLd
    private readonly vocabUtil: VocabUtil

    // x -> xByLang
    private langContainerAlias: Record<PropertyName, PropertyName> = {}
    // xByLang -> x
    private langContainerAliasInverted: Record<PropertyName, PropertyName> = {}

    constructor(display: DisplayJsonLd, vocabUtil: VocabUtil) {
        this.display = display
        this.vocabUtil = vocabUtil
        this.buildLangContainerAliasMap()
        this.expandInheritedLensProperties()
        this.eachLens(lens => {
           console.log(lens.showProperties)
        });
    }

    applyLens(thing: object, lens: LensType) {

    }

    lens(lens: LensType) {
        console.log(this.display.lensGroups[lens])
    }

    private buildLangContainerAliasMap() {
        for (const [k, v] of Object.entries({...this.vocabUtil.context, ...this.display[Key.CONTEXT]})) {
            if(isLangContainer(v as Record<string, string>)) {
                this.langContainerAlias[(v as Record<string, string>)[Key.ID]] = k
            }
        }

        this.langContainerAliasInverted = invert(this.langContainerAlias);
    }

    private expandInheritedLensProperties() {
        const lensesById: Record<string, Lens> = {}
        this.eachLens( lens => {
            if (lens[Key.ID]) {
                lensesById[lens[Key.ID]] = lens
            }
        });

        const flattenedProps = (lens: Lens, hierarchy: string[]): ShowProperties => {
            if (lens[Key.ID] && hierarchy.includes(lens[Key.ID])) {
                throw Error(`fresnel:extends inheritance loop: ${hierarchy}`)
            }

            const superLensId = lens["fresnel:extends"]?.[Key.ID]
            if (!superLensId) {
                return lens.showProperties
            }
            else {
                if (!lensesById[superLensId]) {
                    throw Error(`Super lens not found: ${lens[Key.ID]} fresnel:extends ${superLensId}`)
                }

                if (lens["@id"]) {
                    hierarchy.push(lens[Key.ID]!)
                }
                const superProps = flattenedProps(lensesById[superLensId], hierarchy)
                let props = lens.showProperties
                if (!props.includes('fresnel:super')) {
                    props = (['fresnel:super'] as ShowProperties).concat(props);
                }
                return props.map(p => p === 'fresnel:super' ? superProps : p).flat()
            }
        }

        this.eachLens ( lens => {
           lens.showProperties = flattenedProps(lens, [])
           delete lens["fresnel:extends"]
        });
    }

    /*
    private expandAliasesInLensProperties() {
        const expand = (p: string) => {
            const alias = this.langContainerAlias[p];
            return alias ? [p, alias] : p;
        };

        this.eachLens((lens) => {
           lens.showProperties = lens.showProperties.map((p) => {
               // We only expand @language containers so { subPropertyOf:, range: } in alternateProperties
               // is not applicable since language maps can only contain strings.
               //const isAlternateProperties = typeof p !== "string"
               const vv = isAlternateProperties(p)
                   ? mapValuesOfObject(p, v => v.map(p2 => expand(p2)).flat() )
                   : expand(p);
                console.log(vv);
               return vv;
           }).flat();
        });
    }

     */




    private eachLens(fn: (a: Lens) => void) {
        const groups = Object.values(this.display.lensGroups)
            .filter(g => g[Key.TYPE] === 'fresnel:Group') // TODO until "formatters" is moved
        const lenses = groups.map(g => Object.values(g.lenses)).flat()
        for (const lens of lenses) {
            fn(lens);
        }
    }
}

function invert<K extends string | number | symbol, V extends string | number | symbol>(obj: Record<K, V>): Record<V, K> {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));
}

function mapValuesOfObject<V, V2>(obj: { string: V }, fn: (v: V, k: string, i: number) => V2): { string: V2 } {
    return Object.fromEntries(
        Object.entries(obj).map(
            ([k, v], i) => [k, fn(v, k, i)]
        )
    )
}

function isAlternateProperties(v: string | AlternateProperties): v is AlternateProperties {
    return typeof v !== 'string' && 'alternateProperties' in v;
}

export function preprocessVocab(vocab) {
    const vocabMap = new Map(vocab['@graph'].map(entry => [entry['@id'], entry]));
    vocabMap.forEach((termObj) => {
        if (termObj && termObj.hasOwnProperty('@id')) {
            let bases = null;
            let subRel = 'baseClassOf';
            for (const baserel of ['subClassOf', 'subPropertyOf']) {
                if (termObj.hasOwnProperty(baserel)) {
                    bases = termObj[baserel];
                    if (baserel === 'subPropertyOf') {
                        subRel = 'basePropertyOf';
                    }
                    break;
                }
            }
            if (!Array.isArray(bases)) {
                return;
            }
            bases.forEach((obj) => {
                if (obj['@id']) {
                    const baseClass = vocabMap.get(obj['@id']);
                    if (baseClass) {
                        if (!Array.isArray(baseClass[subRel])) {
                            baseClass[subRel] = [];
                        }
                        baseClass[subRel].push(termObj);
                    }
                }
            });

            if (termObj['@type'] === 'Class') {
                ['domain', 'domainIncludes', 'range', 'rangeIncludes'].forEach((propertyLinkType) => {
                    const reverseProperties = getReversesByType(propertyLinkType, termObj, vocab);

                    if (reverseProperties.length) {
                        termObj['@reverse'] = {
                            ...termObj['@reverse'],
                            [propertyLinkType]: reverseProperties,
                        };
                    }
                });
            }
        }
    });

    return vocabMap;
}