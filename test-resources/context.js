module.exports = {
  "@context": {
    "@vocab": "https://id.kb.se/vocab/",
    "Class": "owl:Class",
    "Datatype": "rdfs:Datatype",
    "DatatypeProperty": "owl:DatatypeProperty",
    "FunctionalProperty": "owl:FunctionalProperty",
    "ObjectProperty": "owl:ObjectProperty",
    "Ontology": "owl:Ontology",
    "Property": "rdf:Property",
    "Restriction": "owl:Restriction",
    "TransitiveProperty": "owl:TransitiveProperty",
    "_marcBroken": null,
    "_marcFailedFixedFields": null,
    "_marcUncompleted": null,
    "_note": null,
    "_topicTree": null,
    "abstract": "http://protege.stanford.edu/plugins/owl/protege#abstract",
    "acquisitionSource": {
      "@container": "@set"
    },
    "additionalType": {
      "@type": "@vocab"
    },
    "allValuesFrom": {
      "@id": "owl:allValuesFrom"
    },
    "altLabel": {
      "@container": "@set"
    },
    "altLabelByLang": {
      "@container": "@language",
      "@id": "altLabel"
    },
    "shelfMarkStatus": {
      "@type": "@vocab"
    },
    "sliceByDimension": {
      "@container": "@index",
      "@id": "slice"
    },
    "slugProperty": {
      "@type": "@vocab"
    },
    "someValuesFrom": {
      "@id": "owl:someValuesFrom"
    },
    "source": {
      "@container": "@set"
    },
    "subClassOf": {
      "@container": "@set",
      "@id": "rdfs:subClassOf"
    },
    "subPropertyOf": {
      "@container": "@set",
      "@id": "rdfs:subPropertyOf"
    },
    "termComponentList": {
      "@container": "@list"
    },
    "termGroup": "http://purl.org/vocab/vann/termGroup",
    "term_status": "http://www.w3.org/2003/06/sw-vocab-status/ns#term_status",
    "titleByLang": {
      "@container": "@language",
      "@id": "title"
    },
    "unionOf": {
      "@container": "@list",
      "@id": "owl:unionOf"
    },
    "unit": {
      "@container": "@set"
    },
    "uri": {
      "@container": "@set"
    },
    "usageAndAccessPolicy": {
      "@container": "@set"
    },
    "videoCharacteristic": {
      "@container": "@set"
    },
    "sdo": "http://schema.org/",
    "xsd": "http://www.w3.org/2001/XMLSchema#"
  },
  "@graph": [
    {
      "@id": "4tkrb9vl61pgqxrp",
      "@type": "Record",
      "inDataset": [
        {
          "@id": "https://id.kb.se/dataset/definitions"
        },
        {
          "@id": "https://id.kb.se/dataset/sys/context"
        }
      ],
      "mainEntity": {
        "@id": "https://id.kb.se/sys/context/kbv"
      },
      "sameAs": [
        {
          "@id": "https://id.kb.se/vocab/context"
        }
      ]
    },
    {
      "@id": "https://id.kb.se/sys/context/kbv",
      "@type": "jsonld:Context"
    }
  ]
}
