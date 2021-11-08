module.exports = {
  "@graph": [
    {
      "@id": "https://libris.kb.se/00nj5pg324pd3kjp",
      "@type": "Record",
      "created": "2021-09-29T16:38:53.873+02:00",
      "modified": "2021-09-29T16:38:53.873+02:00",
      "inDataset": [
        {
          "@id": "https://id.kb.se/dataset/definitions"
        },
        {
          "@id": "https://id.kb.se/dataset/vocab"
        }
      ],
      "mainEntity": {
        "@id": "https://id.kb.se/vocab/context"
      },
      "recordStatus": "marc:New"
    },
    {
      "@id": "https://id.kb.se/vocab/context"
    },
    {
      "@graph": [
        {
          "@id": "https://libris.kb.se/00046r5325gpfg5l",
          "@type": "Record",
          "created": "2021-09-29T16:38:52.973+02:00",
          "modified": "2021-09-29T16:38:52.973+02:00",
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
          "@id": "https://libris.kb.se/00nj5pg3229cknbr",
          "@type": "Record",
          "created": "2021-09-29T16:38:53.002+02:00",
          "modified": "2021-09-29T16:38:53.002+02:00",
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
          "@id": "https://libris.kb.se/pg46w5d0r2frvwzr",
          "@type": "Record",
          "inDataset": [
            {
              "@id": "https://id.kb.se/dataset/definitions"
            },
            {
              "@id": "https://id.kb.se/dataset/generators"
            }
          ],
          "mainEntity": {
            "@id": "https://id.kb.se/generator/definitions"
          }
        },
        {
          "@id": "https://id.kb.se/generator/definitions",
          "@type": "GenerationProcess",
          "label": "The Definitions Dataset Generator of Libris XL"
        }
      ]
    }
  ],
  "@context": [
    {
      "dc": "http://purl.org/dc/terms/",
      "bf2": "http://id.loc.gov/ontologies/bibframe/",
      "kbv": "https://id.kb.se/vocab/",
      "ldp": "http://www.w3.org/ns/ldp#",
      "owl": "http://www.w3.org/2002/07/owl#",
      "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "sdo": "http://schema.org/",
      "xsd": "http://www.w3.org/2001/XMLSchema#",
      "bibo": "http://purl.org/ontology/bibo/",
      "edtf": "http://id.loc.gov/datatypes/edtf/",
      "foaf": "http://xmlns.com/foaf/0.1/",
      "marc": "https://id.kb.se/marc/",
      "prov": "http://www.w3.org/ns/prov#",
      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
      "skos": "http://www.w3.org/2004/02/skos/core#",
      "void": "http://rdfs.org/ns/void#",
      "hydra": "http://www.w3.org/ns/hydra/core#",
      "@vocab": "https://id.kb.se/vocab/",
      "dctype": "http://purl.org/dc/dcmitype/",
      "fresnel": "http://www.w3.org/2004/09/fresnel#",
      "madsrdf": "http://www.loc.gov/mads/rdf/v1#"
    },
    {
      "DOI": "bf2:Doi",
      "Day": "xsd:gDay",
      "EAN": "bf2:Ean",
      "Hdl": "bf2:Hdl",
      "Hub": "bf2:Hub",
      "ISO": "bf2:Iso",
      "Map": "bibo:Map",
      "NBN": "bf2:Nbn",
      "UPC": "bf2:Upc",
      "URN": "bf2:Urn",
      "uri": {
        "@id": "uri",
        "@type": "xsd:anyURI",
        "@container": "@set"
      },
      "url": {
        "@id": "sdo:url",
        "@type": "xsd:anyURI"
      },
      "Ansi": "bf2:Ansi",
      "Date": "xsd:date",
      "ISAN": "bf2:Isan",
      "ISBN": "bf2:Isbn",
      "ISMN": "bf2:Ismn",
      "ISNI": "bf2:Isni",
      "ISRC": "bf2:Isrc",
      "ISSN": "bf2:Issn",
      "ISTC": "bf2:Istc",
      "ISWC": "bf2:Iswc",
      "Item": "bf2:Item",
      "LCCN": "bf2:Lccn",
      "Note": "bf2:Note",
      "Role": {
        "@id": "bf2:Role"
      },
      "SICI": "bf2:Sici",
      "STRN": "bf2:Strn",
      "Text": "bf2:Text",
      "Time": "xsd:time",
      "Unit": "bf2:Unit",
      "Work": "bf2:Work",
      "Year": "xsd:gYear",
      "code": {
        "@id": "bf2:code"
      },
      "date": {
        "@id": "bf2:date",
        "@container": "@set"
      },
      "meta": "bf2:adminMetadata",
      "name": "foaf:name",
      "note": {
        "@id": "skos:note",
        "@container": "@set"
      },
      "page": "foaf:page",
      "part": {
        "@id": "bf2:part",
        "@container": "@set"
      },
      "role": {
        "@id": "bf2:role",
        "@container": "@set"
      },
      "unit": {
        "@id": "bf2:unit",
        "@container": "@set"
      },
      "Agent": "bf2:Agent",
      "Audio": "bf2:Audio",
      "CODEN": "bf2:Coden",
      "Class": "owl:Class",
      "Event": "bf2:Event",
      "ISSNL": "bf2:IssnL",
      "Local": "bf2:Local",
      "Month": "xsd:gMonth",
      "Mount": "bf2:Mount",
      "Place": "bf2:Place",
      "Print": "bf2:Print",
      "Scale": "bf2:Scale",
      "Title": "bf2:Title",
      "Topic": "bf2:Topic",
      "_note": null,
      "agent": "bf2:agent",
      "count": "bf2:count",
      "focus": "madsrdf:identifiesRWO",
      "index": "bf2:index",
      "label": {
        "@id": "rdfs:label",
        "@container": "@set"
      },
      "mount": {
        "@id": "bf2:mount",
        "@container": "@set"
      },
      "place": {
        "@id": "bf2:place",
        "@container": "@set"
      },
      "range": {
        "@id": "rdfs:range",
        "@container": "@set"
      },
      "scale": "bf2:scale",
      "table": "bf2:table",
      "title": "dc:title",
      "value": "rdf:value",
      "voice": "bf2:voice",
      "width": "sdo:width",
      "Extent": "bf2:Extent",
      "Family": "bf2:Family",
      "GTIN14": "bf2:Gtin14Number",
      "Layout": "bf2:Layout",
      "Object": "bf2:Object",
      "Person": "bf2:Person",
      "Review": "bf2:Review",
      "Script": "bf2:Script",
      "Source": "bf2:Source",
      "Status": "bf2:Status",
      "Visual": "dctype:Image",
      "degree": "bf2:degree",
      "domain": {
        "@id": "rdfs:domain",
        "@container": "@set"
      },
      "entity": "prov:entity",
      "extent": {
        "@id": "bf2:extent",
        "@container": "@set"
      },
      "format": "dc:format",
      "height": "sdo:height",
      "heldBy": "bf2:heldBy",
      "itemOf": "bf2:itemOf",
      "layout": {
        "@id": "bf2:layout",
        "@container": "@set"
      },
      "review": "bf2:review",
      "sameAs": {
        "@id": "owl:sameAs",
        "@container": "@set"
      },
      "source": {
        "@id": "bf2:source",
        "@container": "@set"
      },
      "status": "bf2:status",
      "Barcode": "bf2:Barcode",
      "Capture": "bf2:Capture",
      "Concept": "skos:Concept",
      "Country": {
        "@id": "sdo:Country"
      },
      "Dataset": "bf2:Dataset",
      "Meeting": "bf2:Meeting",
      "Subject": "madsrdf:MADSType",
      "Summary": "bf2:Summary",
      "Tactile": "bf2:Tactile",
      "address": {
        "@id": "sdo:address",
        "@container": "@set"
      },
      "broader": {
        "@id": "madsrdf:hasBroaderAuthority",
        "@container": "@set"
      },
      "capture": {
        "@id": "bf2:capture",
        "@container": "@set"
      },
      "comment": {
        "@id": "rdfs:comment",
        "@container": "@set"
      },
      "created": {
        "@id": "bf2:creationDate",
        "@type": "xsd:dateTime"
      },
      "edition": "bf2:edition",
      "endTime": "sdo:endTime",
      "equinox": "bf2:equinox",
      "example": "madsrdf:exampleNote",
      "hasItem": {
        "@id": "bf2:hasItem",
        "@container": "@set"
      },
      "hasNote": {
        "@id": "bf2:note",
        "@container": "@set"
      },
      "hasPart": {
        "@id": "bf2:hasPart",
        "@container": "@set"
      },
      "imports": {
        "@id": "owl:imports",
        "@container": "@set"
      },
      "indexOf": "bf2:indexOf",
      "keyword": "sdo:keywords",
      "langTag": {
        "@id": "code",
        "@type": "ISO639-1"
      },
      "license": "dc:license",
      "pattern": {
        "@id": "bf2:pattern",
        "@container": "@set"
      },
      "related": {
        "@id": "madsrdf:hasReciprocalAuthority",
        "@container": "@set"
      },
      "seeAlso": {
        "@id": "madsrdf:see",
        "@container": "@set"
      },
      "spanEnd": "bf2:spanEnd",
      "subject": {
        "@id": "bf2:subject",
        "@container": "@set"
      },
      "summary": {
        "@id": "bf2:summary",
        "@container": "@set"
      },
      "unionOf": {
        "@id": "owl:unionOf",
        "@container": "@list"
      },
      "version": "bf2:version",
      "Archival": "bf2:Archival",
      "CoverArt": "bf2:CoverArt",
      "Datatype": "rdfs:Datatype",
      "DateTime": "xsd:dateTime",
      "Document": "foaf:Document",
      "Emulsion": "bf2:Emulsion",
      "FileSize": "bf2:FileSize",
      "FileType": "bf2:FileType",
      "FontSize": "bf2:FontSize",
      "ISO639-1": "dc:ISO639-1",
      "ISO639-2": "dc:ISO639-2",
      "ISO639-3": "dc:ISO639-3",
      "Instance": "bf2:Instance",
      "KeyTitle": "bf2:KeyTitle",
      "Language": {
        "@id": "sdo:Language"
      },
      "Material": "bf2:Material",
      "MonthDay": "xsd:gMonthDay",
      "Notation": "bf2:Notation",
      "Ontology": "owl:Ontology",
      "Polarity": "bf2:Polarity",
      "Property": "rdf:Property",
      "Resource": "rdfs:Resource",
      "Software": "dctype:Software",
      "Standard": "dc:Standard",
      "Temporal": "bf2:Temporal",
      "absorbed": {
        "@id": "bf2:absorbed",
        "@container": "@set"
      },
      "abstract": "http://protege.stanford.edu/plugins/owl/protege#abstract",
      "altLabel": {
        "@id": "skos:altLabel",
        "@container": "@set"
      },
      "assigner": "bf2:assigner",
      "category": "sdo:category",
      "copyNote": {
        "@container": "@set"
      },
      "coverArt": "bf2:coverArt",
      "duration": "bf2:duration",
      "emulsion": "bf2:emulsion",
      "ensemble": "bf2:ensemble",
      "fileName": {
        "@id": "fileName",
        "@type": "xsd:string"
      },
      "fontSize": {
        "@id": "bf2:fontSize",
        "@container": "@set"
      },
      "formatOf": "dc:isFormatOf",
      "hasTitle": {
        "@id": "bf2:title",
        "@container": "@set"
      },
      "hasValue": {
        "@id": "owl:hasValue"
      },
      "homepage": "foaf:homepage",
      "inScheme": {
        "@id": "madsrdf:isMemberOfMADSScheme"
      },
      "includes": {
        "@container": "@set"
      },
      "isPartOf": {
        "@id": "bf2:partOf",
        "@container": "@set"
      },
      "langCode": {
        "@id": "code",
        "@type": "ISO639-2"
      },
      "language": {
        "@id": "bf2:language",
        "@container": "@set"
      },
      "marc:uri": {
        "@container": "@set"
      },
      "material": "bf2:material",
      "mergerOf": {
        "@id": "bf2:mergerOf",
        "@container": "@set"
      },
      "modified": {
        "@id": "bf2:changeDate",
        "@type": "xsd:dateTime"
      },
      "musicKey": "bf2:musicKey",
      "narrower": {
        "@id": "madsrdf:hasNarrowerAuthority",
        "@container": "@set"
      },
      "noteType": "bf2:noteType",
      "partName": {
        "@id": "bf2:partName",
        "@container": "@set"
      },
      "polarity": {
        "@id": "bf2:polarity",
        "@container": "@set"
      },
      "relation": {
        "@id": "prov:hadRole",
        "@container": "@set"
      },
      "replaces": {
        "@id": "dc:replaces",
        "@container": "@set"
      },
      "seriesOf": "bf2:seriesOf",
      "subtitle": "bf2:subtitle",
      "tableSeq": "bf2:tableSeq",
      "variable": {
        "@id": "variable",
        "@type": "xsd:string"
      },
      "AudioTake": "bf2:AudioTake",
      "Container": "ldp:Container",
      "Frequency": "bf2:Frequency",
      "GenreForm": "bf2:GenreForm",
      "MediaType": {
        "@id": "bf2:Media"
      },
      "ShelfMark": "bf2:ShelfMark",
      "UsePolicy": "bf2:UsePolicy",
      "YearMonth": "xsd:gYearMonth",
      "birthDate": "madsrdf:birthDate",
      "birthYear": {
        "@id": "birthDate",
        "@type": "Year"
      },
      "continues": {
        "@id": "bf2:continues",
        "@container": "@set"
      },
      "copyright": {
        "@container": "@set"
      },
      "deathDate": "madsrdf:deathDate",
      "deathYear": {
        "@id": "deathDate",
        "@type": "Year"
      },
      "depiction": {
        "@container": "@set"
      },
      "dimension": {
        "@type": "@vocab"
      },
      "frequency": {
        "@id": "bf2:frequency",
        "@container": "@set"
      },
      "genreForm": {
        "@id": "bf2:genreForm",
        "@container": "@set"
      },
      "givenName": "sdo:givenName",
      "hasFormat": "dc:hasFormat",
      "hasSeries": "bf2:hasSeries",
      "highlight": null,
      "inDataset": {
        "@id": "void:inDataset",
        "@container": "@set"
      },
      "indexedIn": {
        "@container": "@set"
      },
      "lastIssue": "bf2:lastIssue",
      "legalDate": {
        "@id": "bf2:legalDate",
        "@container": "@set"
      },
      "lensGroup": "fresnel:group",
      "mainTitle": "bf2:mainTitle",
      "marc:data": {
        "@id": "marc:data",
        "@container": "@list"
      },
      "mediaType": {
        "@id": "bf2:media",
        "@container": "@set"
      },
      "prefLabel": {
        "@id": "skos:prefLabel"
      },
      "qualifier": {
        "@id": "bf2:qualifier",
        "@container": "@set"
      },
      "relatedTo": {
        "@id": "bf2:relatedTo",
        "@container": "@set"
      },
      "scopeNote": {
        "@id": "skos:scopeNote",
        "@container": "@set"
      },
      "shelfMark": "bf2:shelfMark",
      "splitInto": {
        "@id": "bf2:splitInto",
        "@container": "@set"
      },
      "startTime": "sdo:startTime",
      "termGroup": "http://purl.org/vocab/vann/termGroup",
      "versionOf": "dc:isVersionOf",
      "voiceType": "bf2:voiceType",
      "BookFormat": "bf2:BookFormat",
      "Chronology": "bf2:Chronology",
      "Collection": "bf2:Collection",
      "Electronic": "bf2:Electronic",
      "Generation": "bf2:Generation",
      "Geographic": "madsrdf:Geographic",
      "Identifier": "bf2:Identifier",
      "Manuscript": "bf2:Manuscript",
      "Multimedia": "bf2:Multimedia",
      "MusicPlate": "bf2:MusicPlate",
      "MusicVoice": "bf2:MusicVoice",
      "Occupation": "madsrdf:Occupation",
      "Production": "bf2:Production",
      "Projection": "bf2:Projection",
      "Resolution": "bf2:Resolution",
      "StillImage": "bf2:StillImage",
      "TapeConfig": "bf2:TapeConfig",
      "_topicTree": null,
      "absorbedBy": {
        "@id": "bf2:absorbedBy",
        "@container": "@set"
      },
      "accessMode": "sdo:accessMode",
      "awardsNote": "bf2:awards",
      "birthPlace": "madsrdf:birthPlace",
      "bookFormat": {
        "@id": "bf2:bookFormat",
        "@container": "@set"
      },
      "broadMatch": {
        "@id": "madsrdf:hasBroaderExternalAuthority",
        "@container": "@set"
      },
      "changeNote": "skos:changeNote",
      "closeMatch": {
        "@id": "madsrdf:hasCloseExternalAuthority",
        "@container": "@set"
      },
      "conformsTo": "dc:conformsTo",
      "dataSource": {
        "@id": "bf2:dataSource",
        "@container": "@set"
      },
      "deathPlace": "madsrdf:deathPlace",
      "definition": {
        "@id": "madsrdf:definitionNote"
      },
      "dimensions": "bf2:dimensions",
      "exactMatch": {
        "@id": "madsrdf:hasExactExternalAuthority",
        "@container": "@set"
      },
      "familyName": "sdo:familyName",
      "findingAid": "bf2:findingAid",
      "firstIssue": "bf2:firstIssue",
      "generation": {
        "@id": "bf2:generation",
        "@container": "@set"
      },
      "hasDataset": {
        "@id": "sdo:dataset",
        "@container": "@set"
      },
      "hasVariant": {
        "@container": "@set"
      },
      "hasVersion": {
        "@id": "dc:hasVersion",
        "@container": "@set"
      },
      "identifier": "dc:identifier",
      "identifies": "bf2:identifies",
      "instanceOf": "bf2:instanceOf",
      "instrument": "bf2:instrument",
      "issuedWith": {
        "@container": "@set"
      },
      "mainEntity": "sdo:mainEntity",
      "marc:parts": {
        "@id": "marc:parts",
        "@container": "@list"
      },
      "marc:value": {
        "@id": "marc:value",
        "@type": "xsd:string"
      },
      "noteByLang": {
        "@id": "skos:note",
        "@container": "@language"
      },
      "numeration": {
        "@container": "@set"
      },
      "onProperty": {
        "@id": "owl:onProperty"
      },
      "originDate": "bf2:originDate",
      "outerGRing": "bf2:outerGRing",
      "partNumber": {
        "@id": "bf2:partNumber",
        "@container": "@set"
      },
      "precededBy": {
        "@id": "bf2:precededBy",
        "@container": "@set"
      },
      "production": {
        "@container": "@set"
      },
      "projection": "bf2:projection",
      "references": "bf2:references",
      "replacedBy": "bf2:replacedBy",
      "subClassOf": {
        "@id": "rdfs:subClassOf",
        "@container": "@set"
      },
      "supplement": {
        "@id": "bf2:supplement",
        "@container": "@set"
      },
      "Affiliation": "madsrdf:Affiliation",
      "AnyDateTime": "edtf:EDTF-level0",
      "Arrangement": "bf2:Arrangement",
      "AspectRatio": "bf2:AspectRatio",
      "CarrierType": {
        "@id": "bf2:Carrier"
      },
      "Cartography": "bf2:Cartography",
      "ContentType": {
        "@id": "bf2:Content"
      },
      "DataCatalog": "sdo:DataCatalog",
      "DataService": "sdo:DataDownload",
      "Enumeration": "bf2:Enumeration",
      "Fingerprint": "bf2:Fingerprint",
      "Manufacture": "bf2:Manufacture",
      "MediaObject": "sdo:MediaObject",
      "MovingImage": "bf2:MovingImage",
      "MusicFormat": "bf2:MusicFormat",
      "MusicMedium": "bf2:MusicMedium",
      "ObjectCount": "bf2:ObjectCount",
      "Publication": "bf2:Publication",
      "Restriction": "owl:Restriction",
      "StockNumber": "bf2:StockNumber",
      "StudyNumber": "bf2:StudyNumber",
      "Sublocation": "bf2:Sublocation",
      "TrackConfig": "bf2:TrackConfig",
      "VideoFormat": "bf2:VideoFormat",
      "_marcBroken": null,
      "accompanies": "bf2:accompanies",
      "alternative": "dc:alternative",
      "arrangement": {
        "@id": "bf2:arrangement",
        "@container": "@set"
      },
      "aspectRatio": "bf2:aspectRatio",
      "carrierType": {
        "@id": "bf2:carrier",
        "@container": "@set"
      },
      "contentSize": "sdo:contentSize",
      "contentType": {
        "@id": "bf2:content",
        "@container": "@set"
      },
      "continuedBy": {
        "@id": "bf2:continuedBy",
        "@container": "@set"
      },
      "coordinates": "bf2:coordinates",
      "creditsNote": "bf2:credits",
      "derivedFrom": "bf2:derivedFrom",
      "describedBy": {
        "@container": "@set"
      },
      "description": "dc:description",
      "hasInstance": {
        "@id": "bf2:hasInstance",
        "@container": "@set"
      },
      "hasNotation": {
        "@id": "bf2:notation",
        "@container": "@set"
      },
      "hasPartList": {
        "@id": "hasPart",
        "@container": "@list"
      },
      "hiddenLabel": {
        "@id": "skos:hiddenLabel"
      },
      "historyNote": {
        "@id": "skos:historyNote",
        "@container": "@set"
      },
      "isDefinedBy": {
        "@id": "rdfs:isDefinedBy"
      },
      "isVersionOf": {
        "@id": "dc:isVersionOf"
      },
      "issueNumber": "sdo:issueNumber",
      "itemPortion": "bf2:itemPortion",
      "labelByLang": {
        "@id": "rdfs:label",
        "@container": "@language"
      },
      "langCodeBib": {
        "@id": "code",
        "@type": "ISO639-2-B"
      },
      "manufacture": {
        "@container": "@set"
      },
      "marc:relief": {
        "@container": "@set"
      },
      "memberClass": {
        "@type": "@vocab",
        "@container": "@set"
      },
      "musicFormat": {
        "@id": "bf2:musicFormat",
        "@container": "@set"
      },
      "musicMedium": {
        "@id": "bf2:musicMedium",
        "@container": "@set"
      },
      "narrowMatch": {
        "@id": "madsrdf:hasNarrowerExternalAuthority",
        "@container": "@set"
      },
      "nationality": {
        "@container": "@set"
      },
      "originPlace": "bf2:originPlace",
      "publication": {
        "@container": "@set"
      },
      "sublocation": "bf2:sublocation",
      "subseriesOf": {
        "@id": "bf2:subseriesOf",
        "@container": "@set"
      },
      "succeededBy": {
        "@id": "bf2:succeededBy",
        "@container": "@set"
      },
      "term_status": "http://www.w3.org/2003/06/sw-vocab-status/ns#term_status",
      "titleByLang": {
        "@id": "title",
        "@container": "@language"
      },
      "translation": {
        "@id": "bf2:translation",
        "@container": "@set"
      },
      "variantType": "bf2:variantType",
      "AccessPolicy": "bf2:AccessPolicy",
      "BaseMaterial": "bf2:BaseMaterial",
      "Cartographic": "bf2:Cartographic",
      "ColorContent": "bf2:ColorContent",
      "Contribution": "bf2:Contribution",
      "Dissertation": "bf2:Dissertation",
      "Distribution": "bf2:Distribution",
      "Illustration": "bf2:Illustration",
      "IssuanceType": {
        "@id": "bf2:Issuance"
      },
      "Jurisdiction": "bf2:Jurisdiction",
      "MatrixNumber": "bf2:MatrixNumber",
      "NotatedMusic": "bf2:NotatedMusic",
      "Organization": "bf2:Organization",
      "PlayingSpeed": "bf2:PlayingSpeed",
      "ReportNumber": "bf2:ReportNumber",
      "ResourceView": "sdo:ItemPage",
      "ShelfMarkDdc": "bf2:ShelfMarkDdc",
      "ShelfMarkLcc": "bf2:ShelfMarkLcc",
      "ShelfMarkNlm": "bf2:ShelfMarkNlm",
      "ShelfMarkUdc": "bf2:ShelfMarkUdc",
      "SoundContent": "bf2:SoundContent",
      "VariantTitle": "bf2:VariantTitle",
      "availability": {
        "@id": "sdo:availability",
        "@container": "@set"
      },
      "baseMaterial": {
        "@id": "bf2:baseMaterial",
        "@container": "@set"
      },
      "bibliography": {
        "@container": "@set"
      },
      "citationNote": "madsrdf:citationNote",
      "colorContent": {
        "@id": "bf2:colorContent",
        "@container": "@set"
      },
      "contribution": {
        "@id": "bf2:contribution",
        "@container": "@set"
      },
      "derivativeOf": "bf2:derivativeOf",
      "dissertation": {
        "@id": "bf2:dissertation",
        "@container": "@set"
      },
      "distribution": {
        "@container": "@set"
      },
      "ensembleType": "bf2:ensembleType",
      "eventContent": "bf2:eventContent",
      "expressionOf": "bf2:expressionOf",
      "findingAidOf": "bf2:findingAidOf",
      "hasComponent": {
        "@container": "@set"
      },
      "hasSubseries": {
        "@id": "bf2:hasSubseries",
        "@container": "@set"
      },
      "identifiedBy": {
        "@id": "bf2:identifiedBy",
        "@container": "@set"
      },
      "inCollection": {
        "@id": "madsrdf:isMemberOfMADSCollection",
        "@container": "@set"
      },
      "includesList": {
        "@id": "includes",
        "@container": "@list"
      },
      "isReplacedBy": {
        "@id": "dc:isReplacedBy"
      },
      "issuanceType": {
        "@id": "bf2:issuance",
        "@type": "@vocab"
      },
      "langCodeFull": {
        "@id": "code",
        "@type": "ISO639-3"
      },
      "langCodeTerm": {
        "@id": "code",
        "@type": "ISO639-2-T"
      },
      "mergedToForm": {
        "@id": "bf2:mergedToForm",
        "@container": "@set"
      },
      "otherEdition": {
        "@id": "bf2:otherEdition",
        "@container": "@set"
      },
      "recordStatus": {
        "@type": "@vocab"
      },
      "referencedBy": "bf2:referencedBy",
      "relationship": {
        "@container": "@set"
      },
      "schedulePart": "bf2:schedulePart",
      "slugProperty": {
        "@type": "@vocab"
      },
      "soundContent": "bf2:soundContent",
      "supplementTo": {
        "@id": "bf2:supplementTo",
        "@container": "@set"
      },
      "volumeNumber": "sdo:volumeNumber",
      "AdminMetadata": "bf2:AdminMetadata",
      "ConceptScheme": "skos:ConceptScheme",
      "LcOverseasAcq": "bf2:LcOverseasAcq",
      "MixedMaterial": "bf2:MixedMaterial",
      "MusicEnsemble": "bf2:MusicEnsemble",
      "MusicNotation": "bf2:MusicNotation",
      "ParallelTitle": "bf2:ParallelTitle",
      "QualifiedRole": "sdo:Role",
      "accompaniedBy": "bf2:accompaniedBy",
      "adminMetadata": "bf2:adminMetadata",
      "allValuesFrom": {
        "@id": "owl:allValuesFrom"
      },
      "commentByLang": {
        "@id": "rdfs:comment",
        "@container": "@language"
      },
      "copyrightDate": "bf2:copyrightDate",
      "editorialNote": {
        "@id": "skos:editorialNote",
        "@container": "@set"
      },
      "encodingLevel": {
        "@type": "@vocab"
      },
      "establishDate": "madsrdf:establishDate",
      "hasDerivative": "bf2:hasDerivative",
      "hasExpression": "bf2:hasExpression",
      "hasOccupation": {
        "@id": "madsrdf:occupation",
        "@container": "@set"
      },
      "historyOfWork": "bf2:historyOfWork",
      "inDataCatalog": {
        "@id": "sdo:includedInDataCatalog",
        "@container": "@set"
      },
      "marc:hostName": {
        "@container": "@set"
      },
      "marc:linkText": {
        "@container": "@set"
      },
      "marc:nameForm": {
        "@type": "@vocab"
      },
      "marc:partList": {
        "@container": "@list"
      },
      "rangeIncludes": {
        "@id": "sdo:rangeIncludes",
        "@container": "@set"
      },
      "replacementOf": "bf2:replacementOf",
      "separatedFrom": {
        "@id": "bf2:separatedFrom",
        "@container": "@set"
      },
      "subPropertyOf": {
        "@id": "rdfs:subPropertyOf",
        "@container": "@set"
      },
      "technicalNote": {
        "@container": "@set"
      },
      "terminateDate": "madsrdf:terminateDate",
      "translationOf": {
        "@id": "bf2:translationOf",
        "@container": "@set"
      },
      "ApproxDateTime": "edtf:EDTF-level1",
      "Classification": "bf2:Classification",
      "ComplexSubject": "madsrdf:ComplexSubject",
      "EncodedBitrate": "bf2:EncodedBitrate",
      "EncodingFormat": "bf2:EncodingFormat",
      "ObjectProperty": "owl:ObjectProperty",
      "ReductionRatio": "bf2:ReductionRatio",
      "TermCollection": "madsrdf:MADSCollection",
      "absorbedInPart": {
        "@container": "@set"
      },
      "additionalName": "sdo:additionalName",
      "additionalType": {
        "@type": "@vocab"
      },
      "administeredBy": {
        "@container": "@set"
      },
      "altLabelByLang": {
        "@id": "skos:altLabel",
        "@container": "@language"
      },
      "citationSource": {
        "@container": "@set"
      },
      "classification": {
        "@id": "bf2:classification",
        "@container": "@set"
      },
      "collectionItem": "madsrdf:hasMADSCollectionMember",
      "domainIncludes": {
        "@id": "sdo:domainIncludes",
        "@container": "@set"
      },
      "encodingFormat": "sdo:encodingFormat",
      "eventContentOf": "bf2:eventContentOf",
      "exclusionGRing": "bf2:exclusionGRing",
      "generationDate": "bf2:generationDate",
      "hasAffiliation": {
        "@id": "madsrdf:hasAffiliation",
        "@container": "@set"
      },
      "intersectionOf": {
        "@id": "owl:intersectionOf",
        "@container": "@list"
      },
      "marc:hasBib976": {
        "@container": "@set"
      },
      "marc:isPrivate": {
        "@id": "marc:isPrivate",
        "@type": "@vocab"
      },
      "marc:relatedAs": {
        "@container": "@set"
      },
      "marc:thesaurus": {
        "@type": "@vocab"
      },
      "recordPriority": null,
      "reductionRatio": {
        "@id": "bf2:reductionRatio",
        "@container": "@set"
      },
      "reproductionOf": "bf2:reproductionOf",
      "someValuesFrom": {
        "@id": "owl:someValuesFrom"
      },
      "AccessionNumber": "bf2:AccessionNumber",
      "AppliedMaterial": "bf2:AppliedMaterial",
      "CollectiveTitle": "bf2:CollectiveTitle",
      "CopyrightNumber": "bf2:CopyrightNumber",
      "DirectContainer": "ldp:DirectContainer",
      "MusicInstrument": "bf2:MusicInstrument",
      "NotatedMovement": "bf2:NotatedMovement",
      "PartialDateTime": "edtf:EDTF-level2",
      "ProjectionSpeed": "bf2:ProjectionSpeed",
      "PublisherNumber": "bf2:PublisherNumber",
      "RecordingMedium": "bf2:RecordingMedium",
      "RecordingMethod": "bf2:RecordingMethod",
      "RetentionPolicy": "bf2:RetentionPolicy",
      "StructuredValue": "sdo:StructuredValue",
      "TableOfContents": "bf2:TableOfContents",
      "TactileNotation": "bf2:TactileNotation",
      "activityEndDate": "madsrdf:activityEndDate",
      "appliedMaterial": {
        "@id": "bf2:appliedMaterial",
        "@container": "@set"
      },
      "associatedMedia": {
        "@id": "sdo:associatedMedia",
        "@container": "@set"
      },
      "cataloguersNote": {
        "@container": "@set"
      },
      "continuesInPart": {
        "@id": "bf2:continuesInPart",
        "@container": "@set"
      },
      "equivalentClass": {
        "@id": "owl:equivalentClass",
        "@container": "@set"
      },
      "fieldOfActivity": {
        "@id": "madsrdf:fieldOfActivity",
        "@container": "@set"
      },
      "hasReproduction": {
        "@id": "bf2:hasReproduction",
        "@container": "@set"
      },
      "hasTypeOfFamily": {
        "@container": "@set"
      },
      "marc:publicNote": {
        "@container": "@set"
      },
      "marc:typeOfDate": {
        "@type": "@vocab"
      },
      "musicOpusNumber": "bf2:musicOpusNumber",
      "natureOfContent": "bf2:natureOfContent",
      "originalVersion": "bf2:originalVersion",
      "prefLabelByLang": {
        "@id": "skos:prefLabel",
        "@container": "@language"
      },
      "scopeNoteByLang": {
        "@id": "skos:scopeNote",
        "@container": "@language"
      },
      "seriesStatement": {
        "@id": "bf2:seriesStatement",
        "@container": "@set"
      },
      "shelfMarkStatus": {
        "@type": "@vocab"
      },
      "sourceConsulted": {
        "@id": "madsrdf:hasSource",
        "@container": "@set"
      },
      "tableOfContents": {
        "@id": "bf2:tableOfContents",
        "@container": "@set"
      },
      "AbbreviatedTitle": "bf2:AbbreviatedTitle",
      "AudioIssueNumber": "bf2:AudioIssueNumber",
      "DataDistribution": "sdo:DataDownload",
      "DatatypeProperty": "owl:DatatypeProperty",
      "IntendedAudience": "bf2:IntendedAudience",
      "ItemAvailability": "sdo:ItemAvailability",
      "MovementNotation": "bf2:MovementNotation",
      "PlaybackChannels": "bf2:PlaybackChannels",
      "ProductionMethod": "bf2:ProductionMethod",
      "RegionalEncoding": "bf2:RegionalEncoding",
      "_marcUncompleted": null,
      "absorbedInPartBy": {
        "@container": "@set"
      },
      "acquisitionTerms": {
        "@id": "bf2:acquisitionTerms",
        "@container": "@set"
      },
      "associatedLocale": {
        "@container": "@set"
      },
      "callNumberPrefix": {
        "@container": "@set"
      },
      "callNumberSuffix": {
        "@container": "@set"
      },
      "changeNoteByLang": {
        "@id": "skos:changeNote",
        "@container": "@language"
      },
      "custodialHistory": "bf2:custodialHistory",
      "definitionByLang": {
        "@id": "skos:definition",
        "@container": "@language"
      },
      "editionStatement": {
        "@id": "bf2:editionStatement",
        "@container": "@set"
      },
      "instrumentalType": "bf2:instrumentalType",
      "intendedAudience": {
        "@id": "bf2:intendedAudience",
        "@container": "@set"
      },
      "isPrimaryTopicOf": {
        "@id": "foaf:isPrimaryTopicOf",
        "@container": "@set"
      },
      "marc:displayText": {
        "@container": "@set"
      },
      "marc:hiddenValue": {
        "@container": "@set"
      },
      "marc:holdingType": {
        "@type": "@vocab"
      },
      "marc:summaryType": {
        "@type": "@vocab"
      },
      "physicalLocation": {
        "@id": "bf2:physicalLocation",
        "@container": "@set"
      },
      "precededInPartBy": {
        "@container": "@set"
      },
      "productionMethod": {
        "@id": "bf2:productionMethod",
        "@container": "@set"
      },
      "seriesMembership": {
        "@container": "@set"
      },
      "sliceByDimension": {
        "@id": "slice",
        "@container": "@index"
      },
      "temporalCoverage": "bf2:temporalCoverage",
      "AcquisitionSource": "bf2:AcquisitionSource",
      "BroadcastStandard": "bf2:BroadcastStandard",
      "ClassificationDdc": "bf2:ClassificationDdc",
      "ClassificationLcc": "bf2:ClassificationLcc",
      "ClassificationNlm": "bf2:ClassificationNlm",
      "ClassificationUdc": "bf2:ClassificationUdc",
      "ConceptCollection": "skos:Collection",
      "GenerationProcess": {
        "@id": "bf2:GenerationProcess"
      },
      "IndirectContainer": "ldp:IndirectContainer",
      "ProvisionActivity": "bf2:ProvisionActivity",
      "SystemRequirement": "bf2:SystemRequirement",
      "acquisitionSource": {
        "@id": "bf2:acquisitionSource",
        "@container": "@set"
      },
      "activityStartDate": "madsrdf:activityStartDate",
      "continuedInPartBy": {
        "@id": "bf2:continuedInPartBy",
        "@container": "@set"
      },
      "descriptionByLang": {
        "@id": "description",
        "@container": "@language"
      },
      "electronicLocator": {
        "@id": "bf2:electronicLocator",
        "@container": "@set"
      },
      "generationProcess": "bf2:generationProcess",
      "hasHistoricalData": {
        "@container": "@set"
      },
      "hierarchicalLevel": "bf2:hierarchicalLevel",
      "marc:audienceType": {
        "@type": "@vocab"
      },
      "marc:canceledIssn": {
        "@container": "@set"
      },
      "marc:i1codeSource": {
        "@type": "@vocab"
      },
      "marc:languageCode": {
        "@type": "@vocab"
      },
      "marc:subjectLevel": {
        "@type": "@vocab"
      },
      "musicSerialNumber": "bf2:musicSerialNumber",
      "originalVersionOf": "bf2:originalVersionOf",
      "preferredCitation": "bf2:preferredCitation",
      "provisionActivity": {
        "@id": "bf2:provisionActivity",
        "@container": "@set"
      },
      "seriesEnumeration": "bf2:seriesEnumeration",
      "succeededInPartBy": {
        "@container": "@set"
      },
      "systemRequirement": {
        "@id": "bf2:systemRequirement",
        "@container": "@set"
      },
      "termComponentList": {
        "@id": "madsrdf:componentList",
        "@container": "@list"
      },
      "treatySigningDate": {
        "@container": "@set"
      },
      "FunctionalProperty": "owl:FunctionalProperty",
      "GeographicCoverage": "bf2:GeographicCoverage",
      "PostalRegistration": "bf2:PostalRegistration",
      "PresentationFormat": "bf2:PresentationFormat",
      "associatedLanguage": {
        "@id": "madsrdf:associatedLanguage",
        "@container": "@set"
      },
      "editionEnumeration": "bf2:editionEnumeration",
      "equivalentProperty": {
        "@id": "owl:equivalentProperty",
        "@container": "@set"
      },
      "geographicCoverage": {
        "@id": "bf2:geographicCoverage",
        "@container": "@set"
      },
      "isMemberOfRelation": {
        "@id": "ldp:isMemberOfRelation",
        "@type": "@vocab"
      },
      "marc:incorrectIssn": {
        "@container": "@set"
      },
      "marc:itemCondition": {
        "@container": "@set"
      },
      "membershipResource": "ldp:membershipResource",
      "organizationalUnit": {
        "@container": "@set"
      },
      "propertyChainAxiom": {
        "@id": "owl:propertyChainAxiom",
        "@container": "@list"
      },
      "publicationCountry": {
        "@container": "@set"
      },
      "subseriesStatement": "bf2:subseriesStatement",
      "SoundCharacteristic": "bf2:SoundCharacteristic",
      "VideoCharacteristic": "bf2:VideoCharacteristic",
      "accessibilityHazard": "sdo:accessibilityHazard",
      "datasetDistribution": "sdo:distribution",
      "descriptionLanguage": "bf2:descriptionLanguage",
      "descriptionModifier": "bf2:descriptionModifier",
      "descriptionUpgrader": {
        "@container": "@set"
      },
      "formerShelfLocation": {
        "@container": "@set"
      },
      "grantingInstitution": "bf2:grantingInstitution",
      "illustrativeContent": "bf2:illustrativeContent",
      "marc:i2sourceOfCode": {
        "@type": "@vocab"
      },
      "marc:inventoryLevel": {
        "@container": "@set"
      },
      "marc:sequenceStatus": {
        "@type": "@vocab"
      },
      "musicThematicNumber": "bf2:musicThematicNumber",
      "otherPhysicalFormat": {
        "@id": "bf2:otherPhysicalFormat",
        "@container": "@set"
      },
      "soundCharacteristic": {
        "@id": "bf2:soundCharacteristic",
        "@container": "@set"
      },
      "videoCharacteristic": {
        "@id": "bf2:VideoCharacteristic",
        "@container": "@set"
      },
      "CartographicDataType": "bf2:CartographicDataType",
      "ContentAccessibility": "bf2:ContentAccessibility",
      "GrooveCharacteristic": "bf2:GrooveCharacteristic",
      "ImmediateAcquisition": "bf2:ImmediateAcquisition",
      "MusicPublisherNumber": "bf2:MusicPublisherNumber",
      "SupplementaryContent": "bf2:SupplementaryContent",
      "UsageAndAccessPolicy": "bf2:UsageAndAccessPolicy",
      "VideoRecordingNumber": "bf2:VideoRecordingNumber",
      "accessModeSufficient": "sdo:accessModeSufficient",
      "accessibilityFeature": "sdo:accessibilityFeature",
      "accessibilitySummary": "sdo:accessibilitySummary",
      "contentAccessibility": "bf2:contentAccessibility",
      "immediateAcquisition": {
        "@id": "bf2:immediateAcquisition",
        "@container": "@set"
      },
      "marc:cataloguersNote": {
        "@container": "@set"
      },
      "marc:subordinateUnit": {
        "@container": "@set"
      },
      "subseriesEnumeration": "bf2:subseriesEnumeration",
      "supplementaryContent": "bf2:supplementaryContent",
      "usageAndAccessPolicy": {
        "@id": "bf2:usageAndAccessPolicy",
        "@container": "@set"
      },
      "CopyrightRegistration": "bf2:CopyrightRegistration",
      "DigitalCharacteristic": "bf2:DigitalCharacteristic",
      "PartialCollectionView": "sdo:CollectionPage",
      "classificationPortion": "bf2:classificationPortion",
      "copyrightRegistration": "bf2:copyrightRegistration",
      "digitalCharacteristic": {
        "@id": "bf2:digitalCharacteristic",
        "@container": "@set"
      },
      "hasNumberingOfSerials": {
        "@container": "@set"
      },
      "marc:typeOfTimePeriod": {
        "@type": "@vocab"
      },
      "prominentFamilyMember": "madsrdf:prominentFamilyMember",
      "CartographicObjectType": "bf2:CartographicObjectType",
      "DescriptionConventions": "bf2:DescriptionConventions",
      "DissertationIdentifier": "bf2:DissertationIdentifier",
      "MusicDistributorNumber": "bf2:MusicDistributorNumber",
      "PlaybackCharacteristic": "bf2:PlaybackCharacteristic",
      "_marcFailedFixedFields": null,
      "cartographicAttributes": {
        "@id": "bf2:cartographicAttributes",
        "@container": "@set"
      },
      "codedLocationQualifier": {
        "@container": "@set"
      },
      "descriptionConventions": {
        "@id": "bf2:descriptionConventions",
        "@container": "@set"
      },
      "indirectlyIdentifiedBy": {
        "@container": "@set"
      },
      "marc:publicationStatus": {
        "@type": "@vocab"
      },
      "marc:versionOfResource": {
        "@container": "@set"
      },
      "musicPerformanceMedium": {
        "@container": "@set"
      },
      "organizationOfMaterial": {
        "@id": "bf2:organization",
        "@container": "@set"
      },
      "ascensionAndDeclination": "bf2:ascensionAndDeclination",
      "copyrightArticleFeeCode": {
        "@container": "@set"
      },
      "insertedContentRelation": "ldp:insertedContentRelation",
      "marc:copyIdentification": {
        "@container": "@set"
      },
      "marc:organizationalUnit": {
        "@container": "@set"
      },
      "marc:presentationFormat": {
        "@container": "@set"
      },
      "responsibilityStatement": "bf2:responsibilityStatement",
      "EnumerationAndChronology": "bf2:EnumerationAndChronology",
      "ProjectionCharacteristic": "bf2:ProjectionCharacteristic",
      "enumerationAndChronology": "bf2:enumerationAndChronology",
      "hasProminentFamilyMember": {
        "@container": "@set"
      },
      "marc:performerOrEnsemble": {
        "@container": "@set"
      },
      "projectionCharacteristic": {
        "@id": "bf2:projectionCharacteristic",
        "@container": "@set"
      },
      "DescriptionAuthentication": "bf2:DescriptionAuthentication",
      "descriptionAuthentication": {
        "@id": "bf2:descriptionAuthentication",
        "@container": "@set"
      },
      "editionStatementRemainder": {
        "@container": "@set"
      },
      "marc:hasSystemDetailsNote": {
        "@container": "@set"
      },
      "marc:intermediateLanguage": {
        "@container": "@set"
      },
      "nonCodedLocationQualifier": {
        "@container": "@set"
      },
      "hasBiographicalInformation": {
        "@container": "@set"
      },
      "marc:hasBindingInformation": {
        "@container": "@set"
      },
      "marc:internationalInterest": {
        "@id": "marc:internationalInterest",
        "@type": "xsd:boolean"
      },
      "marc:versionIdentification": {
        "@container": "@set"
      },
      "provisionActivityStatement": "bf2:provisionActivityStatement",
      "additionalClassificationDdc": {
        "@container": "@set"
      },
      "marc:displayConstantController": {
        "@type": "@vocab"
      },
      "marc:filingOfSeriesenumeration": {
        "@container": "@set"
      },
      "marc:commonAuxiliarySubdivision": {
        "@container": "@set"
      },
      "marc:coverageOrLocationInSource": {
        "@type": "@vocab"
      },
      "marc:hasForeignMARCInformationField": {
        "@container": "@set"
      },
      "marc:hasOwnershipAndCustodialHistory": {
        "@container": "@set"
      },
      "marc:constantRatioLinearHorizontalScale": {
        "@container": "@set"
      },
      "marc:hasAddedEntryHierarchicalPlaceName": {
        "@container": "@set"
      },
      "marc:hasCopyAndVersionIdentificationNote": {
        "@container": "@set"
      },
      "marc:titlesAndOtherWordsAssociatedWithAName": {
        "@container": "@set"
      },
      "marc:hasItemInformationSupplementaryMaterial": {
        "@container": "@set"
      },
      "marc:typeCompletenessSourceOfClassCallNumber": {
        "@type": "@vocab"
      },
      "marc:hasItemInformationBasicBibliographicUnit": {
        "@container": "@set"
      },
      "marc:hasTextualHoldingsBasicBibliographicUnit": {
        "@container": "@set"
      },
      "marc:hasGovernmentDocumentClassificationNumber": {
        "@container": "@set"
      }
    }
  ]
}
