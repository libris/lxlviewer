module.exports = {
  "@graph": [
    {
      "@id": "http://libris.kb.se.localhost:5000/00nj5pg320vg4482",
      "@type": "Record",
      "created": "2021-11-11T15:59:37.144+01:00",
      "modified": "2021-11-11T15:59:37.144+01:00",
      "inDataset": [
        {
          "@id": "https://id.kb.se/dataset/definitions"
        },
        {
          "@id": "https://id.kb.se/dataset/vocab"
        }
      ],
      "mainEntity": {
        "@id": "https://id.kb.se/vocab/"
      },
      "recordStatus": "marc:New"
    },
    {
      "@id": "https://id.kb.se/vocab/",
      "@type": "Ontology",
      "sameAs": [
        {
          "@id": "https://id.kb.se/vocab"
        }
      ],
      "imports": [
        {
          "@id": "http://purl.org/dc/terms/"
        },
        {
          "@id": "http://purl.org/dc/dcmitype/"
        },
        {
          "@id": "http://www.w3.org/2004/02/skos/core#"
        },
        {
          "@id": "http://www.w3.org/ns/prov#"
        },
        {
          "@id": "http://xmlns.com/foaf/0.1/"
        },
        {
          "@id": "http://purl.org/ontology/bibo/"
        },
        {
          "@id": "http://schema.org/"
        },
        {
          "@id": "http://id.loc.gov/ontologies/bibframe/"
        },
        {
          "@id": "http://id.loc.gov/ontologies/bflc/"
        }
      ],
      "version": "1.23.0-107-gdeeaf03",
      "dc:license": {
        "@id": "http://creativecommons.org/publicdomain/zero/1.0/"
      },
      "labelByLang": {
        "en": "KB Base Vocabulary",
        "sv": "KB:s basvokabul\u00e4r"
      },
      "commentByLang": {
        "en": "This vocabulary serves as a central mapping to public, well-known properties and classes.",
        "sv": "Detta vokabul\u00e4r fungerar som en central mappning till publika, v\u00e4lk\u00e4nda egenskaper och klasser."
      },
      "skos:hasTopConcept": [
        {
          "@id": "https://id.kb.se/vocab/Instance"
        },
        {
          "@id": "https://id.kb.se/vocab/Work"
        },
        {
          "@id": "https://id.kb.se/vocab/Item"
        },
        {
          "@id": "https://id.kb.se/vocab/Agent"
        },
        {
          "@id": "https://id.kb.se/vocab/IndexTerm"
        }
      ]
    },
    {
      "@id": "https://id.kb.se/vocab/AbbreviatedTitle",
      "@type": "Class",
      "subClassOf": [
        {
          "@id": "https://id.kb.se/vocab/VariantTitle"
        }
      ],
      "isDefinedBy": {
        "@id": "https://id.kb.se/vocab/"
      },
      "labelByLang": {
        "en": "Abbreviated title",
        "sv": "F\u00f6rkortad titel"
      },
      "equivalentClass": [
        {
          "@id": "http://id.loc.gov/ontologies/bibframe/AbbreviatedTitle"
        }
      ]
    },
    {
      "@id": "https://id.kb.se/vocab/AccessModeSufficient",
      "@type": "Class",
      "category": {
        "@id": "https://id.kb.se/vocab/pending"
      },
      "subClassOf": [
        {
          "@id": "https://id.kb.se/vocab/Resource"
        }
      ],
      "isDefinedBy": {
        "@id": "https://id.kb.se/vocab/"
      }
    },
    {
      "@id": "https://id.kb.se/vocab/replacementOf",
      "@type": "ObjectProperty",
      "range": [
        {
          "@id": "https://id.kb.se/vocab/Creation"
        }
      ],
      "category": {
        "@id": "https://id.kb.se/vocab/integral"
      },
      "domain": [
        {
          "@id": "https://id.kb.se/vocab/Creation"
        }
      ],
      "inverseOf": {
        "@id": "https://id.kb.se/vocab/replacedBy"
      },
      "isDefinedBy": {
        "@id": "https://id.kb.se/vocab/"
      },
      "labelByLang": {
        "en": [
          "Preceded by",
          "replacement of"
        ],
        "sv": "ers\u00e4tter"
      },
      "subPropertyOf": [
        {
          "@id": "https://id.kb.se/vocab/precededBy"
        }
      ],
      "equivalentProperty": [
        {
          "@id": "http://id.loc.gov/ontologies/bibframe/replacementOf"
        }
      ]
    },
    {
      "@id": "https://id.kb.se/vocab/shelfControlNumber",
      "@type": "DatatypeProperty",
      "range": [
        {
          "@id": "http://www.w3.org/2000/01/rdf-schema#Literal"
        }
      ],
      "domain": [
        {
          "@id": "https://id.kb.se/vocab/Item"
        }
      ],
      "noteByLang": {
        "sv": "Kan \u00e4ven kombineras med ytterligare placeringsuppgifter."
      },
      "isDefinedBy": {
        "@id": "https://id.kb.se/vocab/"
      },
      "labelByLang": {
        "sv": "Hyllsignum: L\u00f6pnummer"
      },
      "skos:example": "96-3899",
      "commentByLang": {
        "sv": "Om materialet st\u00e4lls upp efter n\u00e5gon form av l\u00f6pande numrering. Kan kombineras med ytterligare placeringsuppgifter, t.ex. klassifikation eller titel-/f\u00f6rfattarord."
      }
    },
    {
      "@id": "https://id.kb.se/marc/CatFormType",
      "code": "CatFormType",
      "@type": "marc:CollectionClass",
      "subClassOf": [
        {
          "@id": "https://id.kb.se/vocab/DescriptionConventions"
        },
        {
          "@id": "https://id.kb.se/marc/EnumeratedTerm"
        }
      ],
      "prefLabelByLang": {
        "en": "Cataloging Form",
        "sv": "Regler f\u00f6r deskriptiv katalogisering (bib)"
      }
    },
    {
      "@id": "https://id.kb.se/marc/isPrivate",
      "@type": "DatatypeProperty",
      "range": [
        {
          "@id": "http://www.w3.org/2001/XMLSchema#boolean"
        }
      ],
      "labelByLang": {
        "sv": "Sekretessbelagd information"
      },
      "domainIncludes": [
        {
          "@id": "https://id.kb.se/marc/ImmediateSourceOfAcquisitionNote"
        },
        {
          "@id": "https://id.kb.se/marc/ActionNote"
        },
        {
          "@id": "https://id.kb.se/vocab/ImmediateAcquisition"
        }
      ]
    },
    {
      "@id": "https://id.kb.se/term/swepub/HostType",
      "@type": "EnumerationClass",
      "category": {
        "@id": "https://id.kb.se/vocab/pending"
      },
      "subClassOf": [
        {
          "@id": "https://id.kb.se/vocab/GenreForm"
        }
      ]
    },
    {
      "@graph": [
        {
          "@id": "http://libris.kb.se.localhost:5000/00046r5325gpfg5l",
          "@type": "Record",
          "created": "2021-10-25T01:29:49.661+02:00",
          "modified": "2021-10-25T01:29:49.661+02:00",
          "inDataset": [
            {
              "@id": "https://id.kb.se/dataset/definitions"
            }
          ],
          "mainEntity": {
            "@id": "https://id.kb.se/dataset/definitions"
          },
          "recordStatus": "marc:New",
          "generationProcess": {
            "@id": "https://id.kb.se/generator/definitions"
          }
        },
        {
          "@id": "https://id.kb.se/dataset/definitions",
          "@type": "Dataset",
          "label": "definitions"
        }
      ]
    },
    {
      "@graph": [
        {
          "@id": "http://libris.kb.se.localhost:5000/00nj5pg3229cknbr",
          "@type": "Record",
          "created": "2021-10-25T01:29:49.698+02:00",
          "modified": "2021-10-25T01:29:49.698+02:00",
          "inDataset": [
            {
              "@id": "https://id.kb.se/dataset/definitions"
            },
            {
              "@id": "https://id.kb.se/dataset/vocab"
            }
          ],
          "mainEntity": {
            "@id": "https://id.kb.se/dataset/vocab"
          },
          "recordStatus": "marc:New",
          "generationProcess": {
            "@id": "https://id.kb.se/generator/definitions"
          }
        },
        {
          "@id": "https://id.kb.se/dataset/vocab",
          "@type": "Dataset",
          "label": "vocab"
        }
      ]
    },
    {
      "@graph": [
        {
          "@id": "http://libris.kb.se.localhost:5000/pg46w5d0r2frvwzr",
          "@type": "Record",
          "mainEntity": {
            "@id": "https://id.kb.se/generator/definitions"
          },
          "inDataset": [
            {
              "@id": "https://id.kb.se/dataset/definitions"
            },
            {
              "@id": "https://id.kb.se/dataset/generators"
            }
          ]
        },
        {
          "@id": "https://id.kb.se/generator/definitions",
          "@type": "GenerationProcess",
          "label": "The Definitions Dataset Generator of Libris XL"
        }
      ]
    }
  ],
  "@context": "/context.jsonld"
};
