import { describe, expect, it } from 'vitest';
import { resolveSearchPaths, type SearchPathContext } from './searchPaths.js';

const VOCAB = 'https://id.kb.se/vocab/';
const LS = 'https://id.kb.se/ns/librissearch/';
const MARC = 'https://id.kb.se/marc/';

function link(iri: string) {
	return { '@id': iri };
}

function compactIri(iri: string) {
	if (iri.startsWith(VOCAB)) {
		return iri.slice(VOCAB.length);
	}
	if (iri.startsWith(LS)) {
		return `librissearch:${iri.slice(LS.length)}`;
	}
	if (iri.startsWith(MARC)) {
		return `marc:${iri.slice(MARC.length)}`;
	}
	const lastSegment = iri.split('/').pop() ?? iri;
	return lastSegment;
}

function ctxFor(fixture: Record<string, unknown>, labels: Record<string, string> = {}) {
	return {
		locale: 'sv',
		getDefinition: (name) => {
			const iri = typeof name === 'string' ? name : (name['@id'] as string);
			return (fixture[iri] as Record<string, unknown>) ?? { '@id': iri };
		},
		chipLabel: (def) => (def ? (labels[def['@id'] as string] ?? '') : ''),
		compactIri
	} satisfies SearchPathContext;
}

describe('resolveSearchPaths', () => {
	it('resolves shorthand filters to their property chain', () => {
		const ctx = ctxFor(
			{
				[`${LS}yearPublished`]: {
					'@id': `${LS}yearPublished`,
					category: [link(`${VOCAB}shorthand`)],
					propertyChainAxiom: [{ '@list': [link(`${VOCAB}publication`), link(`${LS}year`)] }]
				},
				[`${LS}year`]: {
					'@id': `${LS}year`,
					category: [link(`${LS}merged`)],
					'ls:merges': [link(`${VOCAB}year`), link(`${VOCAB}startYear`)]
				}
			},
			{
				[`${VOCAB}publication`]: 'utgivning',
				[`${VOCAB}year`]: 'år',
				[`${VOCAB}startYear`]: 'startår'
			}
		);
		expect(resolveSearchPaths(ctx.getDefinition(`${LS}yearPublished`), ctx)).toEqual([
			{
				label: 'utgivning',
				path: 'publication',
				children: [
					{ label: 'år', path: 'year' },
					{ label: 'startår', path: 'startYear' }
				]
			}
		]);
	});

	it('expands merged properties inside chains to their constituent record paths', () => {
		const ctx = ctxFor(
			{
				[`${LS}itemShelf`]: {
					'@id': `${LS}itemShelf`,
					category: [link(`${VOCAB}shorthand`)],
					propertyChainAxiom: [{ '@list': [link(`${VOCAB}hasItem`), link(`${LS}shelf`)] }]
				},
				[`${LS}shelf`]: {
					'@id': `${LS}shelf`,
					category: [link(`${LS}merged`)],
					'ls:merges': [
						link(`${VOCAB}shelfControlNumber`),
						{
							propertyChainAxiom: [{ '@list': [link(`${VOCAB}shelfMark`), link(`${VOCAB}label`)] }]
						},
						{
							propertyChainAxiom: [
								{ '@list': [link(`${VOCAB}availability`), link(`${VOCAB}label`)] }
							]
						}
					]
				}
			},
			{
				[`${VOCAB}hasItem`]: 'Har bestånd',
				[`${VOCAB}shelfControlNumber`]: 'hyllkontrollnummer',
				[`${VOCAB}shelfMark`]: 'hyllsignum',
				[`${VOCAB}availability`]: 'tillgänglighet',
				[`${VOCAB}label`]: 'benämning'
			}
		);
		expect(resolveSearchPaths(ctx.getDefinition(`${LS}itemShelf`), ctx)).toEqual([
			{
				label: 'Har bestånd',
				path: 'hasItem',
				children: [
					{ label: 'hyllkontrollnummer', path: 'shelfControlNumber' },
					{ label: 'hyllsignum › benämning', path: 'shelfMark.label' },
					{ label: 'tillgänglighet › benämning', path: 'availability.label' }
				]
			}
		]);
	});

	it('keeps namespace prefixes such as marc: in paths', () => {
		const ctx = ctxFor(
			{
				[`${LS}internalItemNote`]: {
					'@id': `${LS}internalItemNote`,
					category: [link(`${LS}merged`)],
					'ls:merges': [
						link(`${VOCAB}cataloguersNote`),
						{
							propertyChainAxiom: [
								{
									'@list': [
										link(`${MARC}hasTextualHoldingsBasicBibliographicUnit`),
										link(`${MARC}cataloguersNote`)
									]
								}
							]
						}
					]
				}
			},
			{ [`${VOCAB}cataloguersNote`]: 'Katalogisatörens anmärkning' }
		);
		expect(resolveSearchPaths(ctx.getDefinition(`${LS}internalItemNote`), ctx)).toEqual([
			{ label: 'Katalogisatörens anmärkning', path: 'cataloguersNote' },
			{ label: '', path: 'marc:hasTextualHoldingsBasicBibliographicUnit.marc:cataloguersNote' }
		]);
	});

	it('resolves range restricted anonymous chain elements', () => {
		const ctx = ctxFor({
			[`${LS}isbn`]: {
				'@id': `${LS}isbn`,
				category: [link(`${VOCAB}shorthand`)],
				propertyChainAxiom: [
					{
						'@list': [
							{
								subPropertyOf: [link(`${VOCAB}identifiedBy`)],
								range: [link(`${VOCAB}ISBN`)]
							},
							link(`${VOCAB}value`)
						]
					}
				]
			}
		});
		expect(resolveSearchPaths(ctx.getDefinition(`${LS}isbn`), ctx)).toEqual([
			{ label: 'identifiedBy [ISBN]', path: 'identifiedBy[ISBN].value' }
		]);
	});

	it('resolves owl restriction ranges on anonymous chain elements', () => {
		const ctx = ctxFor(
			{
				[`${LS}sab`]: {
					'@id': `${LS}sab`,
					category: [link(`${VOCAB}shorthand`)],
					propertyChainAxiom: [
						{
							'@list': [
								{
									subPropertyOf: [link(`${VOCAB}classification`)],
									range: [
										{
											subClassOf: [
												{
													'@type': 'Restriction',
													onProperty: link(`${LS}schemeCode`),
													hasValue: 'kssb'
												}
											]
										}
									]
								},
								link(`${VOCAB}code`)
							]
						}
					]
				}
			},
			{ [`${VOCAB}classification`]: 'klassifikation', [`${VOCAB}code`]: 'kod' }
		);
		expect(resolveSearchPaths(ctx.getDefinition(`${LS}sab`), ctx)).toEqual([
			{
				label: 'klassifikation [librissearch:schemeCode: kssb] › kod',
				path: 'classification[librissearch:schemeCode=kssb].code'
			}
		]);
	});

	it('resolves domain restricted anonymous chain elements to their super property', () => {
		const ctx = ctxFor(
			{
				[`${LS}contributor`]: {
					'@id': `${LS}contributor`,
					category: [link(`${LS}composite`)],
					propertyChainAxiom: [
						{ '@list': [link(`${VOCAB}contribution`), link(`${VOCAB}agent`)] },
						{
							'@list': [
								{
									subPropertyOf: [link(`${VOCAB}hasPart`)],
									domain: [link(`${VOCAB}Work`)]
								},
								link(`${VOCAB}contribution`),
								link(`${VOCAB}agent`)
							]
						}
					]
				}
			},
			{
				[`${VOCAB}contribution`]: 'medverkan',
				[`${VOCAB}agent`]: 'agent',
				[`${VOCAB}hasPart`]: 'har del',
				[`${VOCAB}Work`]: 'verk'
			}
		);
		expect(resolveSearchPaths(ctx.getDefinition(`${LS}contributor`), ctx)).toEqual([
			{ label: 'medverkan › agent', path: 'contribution.agent' },
			{ label: 'har del [verk] › medverkan › agent', path: 'hasPart.contribution.agent' }
		]);
	});

	it('resolves composite filters without chains to their sub filters', () => {
		const ctx = ctxFor(
			{
				[`${LS}isxn`]: {
					'@id': `${LS}isxn`,
					category: [link(`${LS}composite`)],
					basePropertyOf: [
						{
							'@id': `${LS}isbn`,
							category: [link(`${VOCAB}shorthand`)],
							propertyChainAxiom: [
								{
									'@list': [
										{
											subPropertyOf: [link(`${VOCAB}identifiedBy`)],
											range: [link(`${VOCAB}ISBN`)]
										},
										link(`${VOCAB}value`)
									]
								}
							]
						},
						{
							'@id': `${LS}issn`,
							category: [link(`${VOCAB}shorthand`)],
							propertyChainAxiom: [
								{
									'@list': [
										{
											subPropertyOf: [link(`${VOCAB}identifiedBy`)],
											range: [link(`${VOCAB}ISSN`)]
										},
										link(`${VOCAB}value`)
									]
								}
							]
						}
					]
				}
			},
			{ [`${VOCAB}identifiedBy`]: 'Identifikator', [`${VOCAB}value`]: 'värde' }
		);
		expect(resolveSearchPaths(ctx.getDefinition(`${LS}isxn`), ctx)).toEqual([
			{ label: 'Identifikator [ISBN] › värde', path: 'identifiedBy[ISBN].value' },
			{ label: 'Identifikator [ISSN] › värde', path: 'identifiedBy[ISSN].value' }
		]);
	});

	it('links to sub filters that are themselves search filters', () => {
		const ctx = ctxFor(
			{
				[`${LS}isxn`]: {
					'@id': `${LS}isxn`,
					category: [link(`${LS}composite`)],
					basePropertyOf: [
						{
							'@id': `${LS}isbn`,
							category: [link(`${VOCAB}shorthand`), link(`${VOCAB}searchfilter`)],
							propertyChainAxiom: [
								{
									'@list': [
										{
											subPropertyOf: [link(`${VOCAB}identifiedBy`)],
											range: [link(`${VOCAB}ISBN`)]
										},
										link(`${VOCAB}value`)
									]
								}
							]
						},
						{
							'@id': `${LS}issn`,
							category: [link(`${VOCAB}shorthand`), link(`${VOCAB}searchfilter`)]
						}
					]
				},
				[`${LS}identifier`]: {
					'@id': `${LS}identifier`,
					category: [link(`${LS}composite`)],
					propertyChainAxiom: [{ '@list': [link(`${VOCAB}identifiedBy`), link(`${VOCAB}value`)] }],
					basePropertyOf: [
						{
							'@id': `${LS}controlNumber`,
							category: [link(`${VOCAB}shorthand`), link(`${VOCAB}searchfilter`)]
						},
						{
							'@id': `${LS}instanceIdentifier`,
							category: [link(`${LS}merged`)],
							'ls:merges': [link(`${VOCAB}indirectlyIdentifiedBy`), link(`${VOCAB}value`)]
						}
					]
				}
			},
			{
				[`${LS}isbn`]: 'ISBN',
				[`${LS}issn`]: 'ISSN',
				[`${LS}controlNumber`]: 'kontrollnummer',
				[`${VOCAB}indirectlyIdentifiedBy`]: 'Indirekt identifierad av',
				[`${VOCAB}value`]: 'värde'
			}
		);
		expect(resolveSearchPaths(ctx.getDefinition(`${LS}isxn`), ctx)).toEqual([
			{ key: 'isbn', label: 'ISBN', path: 'isbn' },
			{ key: 'issn', label: 'ISSN', path: 'issn' }
		]);
		expect(resolveSearchPaths(ctx.getDefinition(`${LS}identifier`), ctx)).toEqual([
			{ label: 'värde', path: 'identifiedBy.value' },
			{ key: 'controlNumber', label: 'kontrollnummer', path: 'controlNumber' },
			{ label: 'Indirekt identifierad av', path: 'indirectlyIdentifiedBy' },
			{ label: 'värde', path: 'value' }
		]);
	});

	it('expands named restricted sub properties to property plus restriction', () => {
		const RELATOR = 'https://id.kb.se/relator/';
		const ctx = ctxFor(
			{
				[`${LS}author`]: {
					'@id': `${LS}author`,
					propertyChainAxiom: [
						{ '@list': [link(`${LS}authorContribution`), link(`${VOCAB}agent`)] }
					]
				},
				[`${LS}authorContribution`]: {
					'@id': `${LS}authorContribution`,
					subPropertyOf: [link(`${VOCAB}contribution`)],
					range: [
						{
							subClassOf: [
								{
									'@type': 'Restriction',
									onProperty: link(`${VOCAB}role`),
									hasValue: link(`${RELATOR}author`)
								}
							]
						}
					]
				},
				[`${VOCAB}contribution`]: {
					'@id': `${VOCAB}contribution`,
					subPropertyOf: [link(`${VOCAB}hasStatement`)],
					range: [link(`${VOCAB}Contribution`)]
				},
				[`${VOCAB}plain`]: {
					'@id': `${VOCAB}plain`,
					propertyChainAxiom: [{ '@list': [link(`${VOCAB}contribution`), link(`${VOCAB}agent`)] }]
				}
			},
			{
				[`${VOCAB}contribution`]: 'Medverkan och funktion',
				[`${VOCAB}role`]: 'funktion',
				[`${VOCAB}agent`]: 'agent'
			}
		);
		expect(resolveSearchPaths(ctx.getDefinition(`${LS}author`), ctx)).toEqual([
			{
				label: 'Medverkan och funktion [funktion: author] › agent',
				path: 'contribution[role=<author>].agent'
			}
		]);
		expect(resolveSearchPaths(ctx.getDefinition(`${VOCAB}plain`), ctx)).toEqual([
			{ label: 'Medverkan och funktion › agent', path: 'contribution.agent' }
		]);
	});

	it('resolves coercing sub filters to their index keys with labels', () => {
		const ctx = ctxFor(
			{
				[`${LS}library`]: {
					'@id': `${LS}library`,
					category: [link(`${LS}composite`)],
					basePropertyOf: [
						{
							'@id': `${LS}itemHeldBy`,
							category: [link(`${LS}coercing`)],
							'ls:indexKey': '@reverse.itemOf.heldBy',
							propertyChainAxiom: [{ '@list': [link(`${VOCAB}hasItem`), link(`${VOCAB}heldBy`)] }]
						},
						{
							'@id': `${LS}itemHeldByOrg`,
							category: [link(`${LS}coercing`)],
							'ls:indexKey': '@reverse.itemOf.heldBy.isPartOf',
							propertyChainAxiom: [
								{
									'@list': [
										link(`${VOCAB}hasItem`),
										link(`${VOCAB}heldBy`),
										link(`${VOCAB}isPartOf`)
									]
								}
							]
						}
					]
				}
			},
			{
				[`${LS}itemHeldBy`]: 'bibliotek (sigel)',
				[`${LS}itemHeldByOrg`]: 'biblioteksorganisation'
			}
		);
		expect(resolveSearchPaths(ctx.getDefinition(`${LS}library`), ctx)).toEqual([
			{ label: 'bibliotek (sigel)', path: 'hasItem.heldBy' },
			{ label: 'biblioteksorganisation', path: 'hasItem.heldBy.isPartOf' }
		]);
	});

	it('resolves merged filters via ls:merges', () => {
		const ctx = ctxFor(
			{
				[`${LS}dewey`]: {
					'@id': `${LS}dewey`,
					category: [link(`${LS}merged`)],
					'ls:merges': [
						{
							propertyChainAxiom: [
								{ '@list': [link(`${VOCAB}additionalClassificationDdc`), link(`${VOCAB}code`)] }
							]
						},
						{
							propertyChainAxiom: [
								{
									'@list': [
										{
											subPropertyOf: [link(`${VOCAB}classification`)],
											range: [link(`${VOCAB}ClassificationDdc`)]
										},
										link(`${VOCAB}code`)
									]
								}
							]
						}
					]
				}
			},
			{
				[`${VOCAB}additionalClassificationDdc`]: 'DDK-klassifikation (Sekundär)',
				[`${VOCAB}code`]: 'kod',
				[`${VOCAB}classification`]: 'klassifikation',
				[`${VOCAB}ClassificationDdc`]: 'DDC'
			}
		);
		expect(resolveSearchPaths(ctx.getDefinition(`${LS}dewey`), ctx)).toEqual([
			{ label: 'DDK-klassifikation (Sekundär) › kod', path: 'additionalClassificationDdc.code' },
			{ label: 'klassifikation [DDC] › kod', path: 'classification[ClassificationDdc].code' }
		]);
	});

	it('shows property chains instead of index keys when both are defined', () => {
		const ctx = ctxFor(
			{
				[`${LS}sab`]: {
					'@id': `${LS}sab`,
					category: [link(`${VOCAB}shorthand`)],
					'ls:indexKey': 'classification._sab',
					propertyChainAxiom: [{ '@list': [link(`${VOCAB}classification`), link(`${VOCAB}code`)] }]
				},
				[`${LS}instanceCategory`]: {
					'@id': `${LS}instanceCategory`,
					'ls:indexKey': '_categoryByCollection.@none'
				}
			},
			{ [`${VOCAB}classification`]: 'klassifikation', [`${VOCAB}code`]: 'kod' }
		);
		expect(resolveSearchPaths(ctx.getDefinition(`${LS}sab`), ctx)).toEqual([
			{ label: 'klassifikation › kod', path: 'classification.code' }
		]);
		expect(resolveSearchPaths(ctx.getDefinition(`${LS}instanceCategory`), ctx)).toEqual([
			{ path: 'librissearch:instanceCategory' }
		]);
	});

	it('falls back to the property itself for plain filters', () => {
		const ctx = ctxFor({
			[`${VOCAB}language`]: { '@id': `${VOCAB}language` }
		});
		expect(resolveSearchPaths(ctx.getDefinition(`${VOCAB}language`), ctx)).toEqual([
			{ path: 'language' }
		]);
	});

	it('deduplicates paths from chains and sub filters', () => {
		const ctx = ctxFor(
			{
				[`${LS}subject`]: {
					'@id': `${LS}subject`,
					category: [link(`${LS}composite`)],
					propertyChainAxiom: [
						{ '@list': [link(`${VOCAB}subject`), link(`${VOCAB}termComponentList`)] }
					],
					basePropertyOf: [
						{
							'@id': `${VOCAB}subject`,
							propertyChainAxiom: [
								{ '@list': [link(`${VOCAB}subject`), link(`${VOCAB}termComponentList`)] }
							]
						}
					]
				}
			},
			{ [`${VOCAB}subject`]: 'ämne', [`${VOCAB}termComponentList`]: 'ämneskomponentlista' }
		);
		expect(resolveSearchPaths(ctx.getDefinition(`${LS}subject`), ctx)).toEqual([
			{ label: 'ämne › ämneskomponentlista', path: 'subject.termComponentList' }
		]);
	});

	it('skips chains with unsupported elements instead of dropping all paths', () => {
		const ctx = ctxFor(
			{
				[`${LS}mixed`]: {
					'@id': `${LS}mixed`,
					propertyChainAxiom: [
						{ '@list': ['not-a-property', link(`${VOCAB}value`)] },
						{ '@list': [link(`${VOCAB}meta`), link(`${VOCAB}created`)] }
					]
				}
			},
			{ [`${VOCAB}meta`]: 'Metadata', [`${VOCAB}created`]: 'skapad' }
		);
		expect(resolveSearchPaths(ctx.getDefinition(`${LS}mixed`), ctx)).toEqual([
			{ label: 'Metadata › skapad', path: 'meta.created' }
		]);
	});
});
