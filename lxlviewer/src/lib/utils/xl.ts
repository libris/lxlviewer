
const LANGUAGE_KEY = '@language';
//const SET_KEY = '@set';
//const LIST_KEY = '@list';
const CONTAINER_KEY = '@container';
const CONTEXT_KEY = '@context';
const ID_KEY = '@id';

/*
function isSetContainer(dfn: Record<string, string>) {
    return dfn[CONTAINER_KEY] == SET_KEY
}

function isListContainer(dfn: Record<string, string>) {
    return dfn[CONTAINER_KEY] == LIST_KEY
}
*/

function isLangContainer(dfn: Record<string, string>) {
    return dfn[CONTAINER_KEY] == LANGUAGE_KEY
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

export class VocabUtil {
    vocab;
    context;

    constructor(vocab: object, context: object) {
        this.vocab = vocab;
        this.context = context;
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

    private buildLangContainerAliasMap() {
        for (const [k, v] of Object.entries({...this.vocabUtil.context, ...this.display[CONTEXT_KEY]})) {
            if(isLangContainer(v as Record<string, string>)) {
                this.langContainerAlias[(v as Record<string, string>)[ID_KEY]] = k
            }
        }

        this.langContainerAliasInverted = invert(this.langContainerAlias);
    }

    private expandInheritedLensProperties() {
        const lensesById: Record<string, Lens> = {}
        this.eachLens( lens => {
            if (lens['@id']) {
                lensesById[lens['@id']] = lens
            }
        });

        const flattenedProps = (lens: Lens, hierarchy: string[]): ShowProperties => {
            if (lens['@id'] && hierarchy.includes(lens['@id'])) {
                throw Error(`fresnel:extends inheritance loop: ${hierarchy}`)
            }

            const superLensId = lens["fresnel:extends"]?.["@id"]
            if (!superLensId) {
                return lens.showProperties
            }
            else {
                if (!lensesById[superLensId]) {
                    throw Error(`Super lens not found: ${lens['@id']} fresnel:extends ${superLensId}`)
                }

                if (lens["@id"]) {
                    hierarchy.push(lens["@id"]!)
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
            .filter(g => g["@type"] === 'fresnel:Group') // TODO until "formatters" is moved
        const lenses = groups.map(g => Object.values(g.lenses)).flat()
        for (const lens of lenses) {
            fn(lens);
        }
    }
}

function invert<K extends string | number | symbol, V extends string | number | symbol >(obj: Record<K, V>): Record<V, K> {
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