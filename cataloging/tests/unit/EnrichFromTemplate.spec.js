import { getChangeList } from "@/utils/enrich";
import { test, expect, vi } from 'vitest';
import * as VocabUtil from 'lxljs/vocab';

vi.mock('lxljs/vocab');

beforeEach(() => {
  const repeatableProps = [
    'contribution',
    'place',
    'label',
    'identifiedBy',
    'role',
    'descriptionConventions',
    'seriesMembership',
    'language',
    'hasNote',
    'hasVariant'
  ];
  VocabUtil.propIsRepeatable.mockImplementation((key) =>
    { return repeatableProps.includes(key) }
  );
});

test('should add contribution if whole property is missing', () => {
  const template = {
    "record": {},
    "mainEntity": {
      "contribution": [
        {
          "@type": "Contribution",
          "agent": null,
          "role": []
        }
      ]
    }
  };

  const record = {
    "record": {},
    "mainEntity": {}
  }
  const templatePath = ['mainEntity'];

  const changeList = getChangeList(template, record, templatePath, templatePath, null)

  expect(changeList).toEqual([{
      path: 'mainEntity.contribution',
      value: [
        {
          "@type": "Contribution",
          "agent": null,
          "role": []
        }]
    }]
  );
});

test('should not add if already present', () => {
  const template = {
    "record": {},
    "mainEntity": {
      "contribution": [
        {
          "@type": "Contribution",
          "agent": null,
          "role": []
        }
      ]
    }
  };

  const record = {
    "record": {},
    "mainEntity": {
      "a" : {},
      "contribution": [
        {
          "@type": "Contribution",
          "agent": null,
          "role": []
        }
      ]
    }
  }
  const templatePath = ['mainEntity'];

  const changeList = getChangeList(template, record, templatePath)

  expect(changeList).toEqual([]);
});

test('should handle multiple properties', () => {
  const template = {
    "record": {},
    "mainEntity": {
      "contribution": [
        {
          "@type": "Contribution",
          "agent": null,
          "role": []
        }
      ],
      "a" : {}
    }
  };

  const record = {
    "record": {},
    "mainEntity": {}
  }
  const templatePath = ['mainEntity'];

  const changeList = getChangeList(template, record, templatePath)

  expect(changeList).toEqual([
    {
      path: 'mainEntity.contribution',
      value: [
        {
          "@type": "Contribution",
          "agent": null,
          "role": []
        }]
    },
    {
      path: 'mainEntity.a',
      value: {}
    }
    ]
  );
});

test('should add role if role is missing in contribution', () => {
  const template = {
    "record": {},
    "mainEntity": {
      "contribution": [
        {
          "@type": "Contribution",
          "agent": null,
          "role": []
        }
      ]
    }
  };

  const record = {
    "record": {},
    "mainEntity": {
      "contribution": [
        {
          "@type": "Contribution",
          "agent": "Something",
        }
      ]
    }
  }
  const templatePath = ['mainEntity'];

  const changeList = getChangeList(template, record, templatePath)

  expect(changeList).toEqual([{
      path: 'mainEntity.contribution[0].role',
      value: []
    }]
  );
});

//  Add test for the case where something is as list in the record
//  but an object in the template?
//  alternatively change template for e.g. hasDimensions in Book template.
//
//  Record:
//   "hasDimensions": [
//         {
//           "@type": "Dimensions",
//           "label": "18 cm"
//         }
//       ]
//
// Template:
//   "hasDimensions": {
//           "@type": "Dimensions",
//           "label": ""
//         }
//
// This is the cause of info message stating wrong number of added properties
// e.g. 3 instead of 1.
//

test('should add role and agent if missing in contribution', () => {
  const template = {
    "record": {},
    "mainEntity": {
      "contribution": [
        {
          "@type": "Contribution",
          "agent": null,
          "role": []
        }
      ]
    }
  };

  const record = {
    "record": {},
    "mainEntity": {
      "contribution": [
        {
          "@type": "Contribution",
        }
      ]
    }
  }
  const templatePath = ['mainEntity'];

  const changeList = getChangeList(template, record, templatePath)

  expect(changeList).toEqual([
    {
      path: 'mainEntity.contribution[0].agent',
      value: null
    },
    {
      path: 'mainEntity.contribution[0].role',
      value: []
    },
    ]
  );
});

test('should add missing element to descriptionConventions for record part', () => {
  const template = {
    "record": {
      "descriptionConventions": [
        {
          "@id": "https://id.kb.se/marc/Isbd"
        },
        {
          "@id": "https://id.kb.se/term/enum/Rda"
        }
      ]
    },
    "mainEntity": {}
  };

  const record = {
    "record": {
      "descriptionConventions": [
        {
          "@id": "https://id.kb.se/marc/Isbd"
        }
      ]
    },
    "mainEntity": {}
  }
  const templatePath = ['record'];

  const changeList = getChangeList(template, record, templatePath)

  expect(changeList).toEqual([
      {
        path: 'record.descriptionConventions[1]',
        value: {'@id': "https://id.kb.se/term/enum/Rda"}
      },
    ]
  );
});

test('should add independent of index', () => {
  const template = {
    "record": {
      "descriptionConventions": [
        {
          "@id": "https://id.kb.se/term/enum/Rda"
        },
      ]
    },
    "mainEntity": {}
  };

  const record = {
    "record": {
      "descriptionConventions": [
        {
          "@id": "https://id.kb.se/marc/Isbd"
        }
      ]
    },
    "mainEntity": {}
  }
  const templatePath = ['record'];

  const changeList = getChangeList(template, record, templatePath)

  expect(changeList).toEqual([
        {
          path: 'record.descriptionConventions[1]',
          value: {'@id': "https://id.kb.se/term/enum/Rda"}
        },
      ]
  );
});

test('should add multiple', () => {
  const template = {
    "record": {
      "descriptionConventions": [
        {
          "@id": "https://id.kb.se/marc/Isbd"
        },
        {
          "@id": "https://id.kb.se/term/enum/Rda"
        },
      ]
    },
    "mainEntity": {}
  };

  const record = {
    "record": {
      "descriptionConventions": [
        {
          "@id": "https://id.kb.se/marc/Aacr2"
        }
      ]
    },
    "mainEntity": {}
  }
  const templatePath = ['record'];

  const changeList = getChangeList(template, record, templatePath)

  expect(changeList).toEqual([
        {
          path: 'record.descriptionConventions[1]',
          value: {'@id': "https://id.kb.se/marc/Isbd"}
        },
        {
          path: 'record.descriptionConventions[2]',
          value: {'@id': "https://id.kb.se/term/enum/Rda"}
        }
      ]
  );
});

// Case: it is a list, but the elements are of differing types
test('should not add subproperties if mismatching types', () => {
  const template = {
    "record": {},
    "mainEntity": {
      "contribution": [
        {
          "@type": "Contribution",
          "agent": null,
          "role": []
        }
      ]
    }
  };

  const record = {
    "record": {},
    "mainEntity": {
      "contribution": [
        {
          "@type": "PrimaryContribution",
          "agent": null,
          "role": [{"@id" : "https://id.kb.se/term/relator/author"}]
        }
      ]
    }
  }
  const templatePath = ['mainEntity'];

  const changeList = getChangeList(template, record, templatePath)

  expect(changeList).toEqual([
    {
      path: 'mainEntity.contribution[1]',
      value: {
        "@type": "Contribution",
        "agent": null,
        "role": []
      }
    },
    ]);
});

test('should enrich list elements independent of order, if present', () => {
  const template = {
    "record": {},
    "mainEntity": {
      "contribution": [
        {
          "@type": "PrimaryContribution",
          "agent": null,
          "role": [{"@id": "https://id.kb.se/term/relator/author"}]
        },
        {
          "@type": "Contribution",
          "agent": null,
          "role": []
        }
      ]
    }
  };

  const record = {
    "record": {},
    "mainEntity": {
      "contribution": [
        {
          "@type": "Contribution",
          "role": []
        },
        {
          "@type": "PrimaryContribution",
          "agent": null,
        }
      ]
    }
  }
  const templatePath = ['mainEntity'];

  const changeList = getChangeList(template, record, templatePath)

  expect(changeList).toEqual([
      {
        path: 'mainEntity.contribution[1].role',
        value: [{"@id": "https://id.kb.se/term/relator/author"}]
      },
      {
        path: 'mainEntity.contribution[0].agent',
        value: null
      }
    ]
  );
});

test('should add typed list element if missing', () => {
  const template = {
    "record": {},
    "mainEntity": {
      "contribution": [
        {
          "@type": "PrimaryContribution",
          "agent": null,
          "role": [{"@id": "https://id.kb.se/term/relator/author"}]
        },
      ]
    }
  };

  const record = {
    "record": {},
    "mainEntity": {
      "contribution": [
        {
          "@type": "Contribution",
          "agent": null,
          "role": []
        }
      ]
    }
  }
  const templatePath = ['mainEntity'];

  const changeList = getChangeList(template, record, templatePath)

  expect(changeList).toEqual([
        {
          path: 'mainEntity.contribution[1]',
          value: {
            "@type": "PrimaryContribution",
            "agent": null,
            "role": [{"@id": "https://id.kb.se/term/relator/author"}]
          }
        }
      ]
  );
});

test('should add and enrich, independent of array index', () => {
  const template = {
    "record": {},
    "mainEntity": {
      "contribution": [
        {
          "@type": "PrimaryContribution",
          "agent": null,
          "role": [{"@id": "https://id.kb.se/term/relator/author"}]
        },
        {
          "@type": "Contribution",
          "agent": null,
          "role": []
        }
      ]
    }
  };

  const record = {
    "record": {},
    "mainEntity": {
      "contribution": [
        {
          "@type": "Contribution",
          "role": []
        }
      ]
    }
  }
  const templatePath = ['mainEntity'];

  const changeList = getChangeList(template, record, templatePath)

  expect(changeList).toEqual([
      {
        path: 'mainEntity.contribution[1]',
        value: {
          "@type": "PrimaryContribution",
          "agent": null,
          "role": [{"@id": "https://id.kb.se/term/relator/author"}]
        }
      },
      {
        path: 'mainEntity.contribution[0].agent',
        value: null
      },
    ]
  );
});

// test('should handle nested properties', () => {
//   const template = {
//     "record": {},
//     "mainEntity": {
//       "seriesMembership": [
//         {
//           "@type": "SeriesMembership",
//           "inSeries": {
//             "@type": "Instance",
//             "identifiedBy": [
//               {
//                 "@type": "ISSN",
//                 "value": ""
//               }
//             ]
//           }
//         }
//       ]
//     }
//   };
//
//   const record = {
//     "record": {},
//     "mainEntity": {
//       "seriesMembership": [
//         {
//           "@type": "SeriesMembership",
//           "inSeries": {
//             "@type": "Instance"
//           }
//         }
//       ]
//     }
//   }
//   const templatePath = ['mainEntity'];
//
//   const changeList = getChangeList(template, record, templatePath)
//
//   expect(changeList).toEqual([
//       {
//         path: 'mainEntity.seriesMembership[0].inSeries.identifiedBy',
//         value:[{"@type": "ISSN", "value": ""}]
//       },
//     ]
//   );
// });

test("should not treat '@id' as a regular property", () => {
  const template = {
    "record": {},
    "mainEntity": { "property" : {'@id' : 'uri'}}
  };

  const record = {
    "record": {},
    "mainEntity": {
      "property" : {
        "@type" : "local",
        "sub" : ""
      }
    }
  }
  const templatePath = ['mainEntity'];

  const changeList = getChangeList(template, record, templatePath)

  expect(changeList).toEqual([]);
});

test('should add multiple entries to array', () => {
  const template = {
    "record": {},
    "mainEntity": {
      "identifiedBy": [
        {
          "@type": "ISBN",
          "qualifier": [
            "CD audio"
          ]
        },
        {
          "@type": "EAN",
          "value": ""
        },
        {
          "@type": "AudioIssueNumber",
          "value": "",
          "agent": {
            "@type": "Organization",
            "name": ""
          }
        }
      ]
    }
  };

  const record = {
    "record": {},
    "mainEntity": {
      "identifiedBy": [
        {
          "@type": "ISBN",
          "value": "9789180332804",
        },
      ]
    }
  }
  const templatePath = ['mainEntity'];

  const changeList = getChangeList(template, record, templatePath)

  expect(changeList).toEqual([
      {
        path: 'mainEntity.identifiedBy[1]',
        value: {
          "@type": "ISBN",
          "qualifier": [
            "CD audio"
            ],
        }
      },
      {
        path: 'mainEntity.identifiedBy[2]',
        value: {
          "@type": "EAN",
          "value": ""
        },
      },
      {
        path: 'mainEntity.identifiedBy[3]',
        value: {
          "@type": "AudioIssueNumber",
          "value": "",
          "agent": {
            "@type": "Organization",
            "name": ""
          },
        },
      }
    ]
  );
});

test('should enrich repeatable property which is not a list in template', () => {
  const template = {
    "record": {},
    "mainEntity": {
      "place": {
        "@type": "Place",
        "label": ""
      },
    }
  };

  const record = {
    "record": {},
    "mainEntity": {
      "place": [
        {
          "@type": "Place",
        }
      ]
    }
  }
  const templatePath = ['mainEntity'];
  const changeList = getChangeList(template, record, templatePath, templatePath, null)

  expect(changeList).toEqual([
    {
      path: 'mainEntity.place[0].label',
      value: [""]
    }
  ]);
});

// Does this work IRL? (It seems!)
test('should change repeatable prop to array before adding', () => {
  const template = {
    "record": {},
    "mainEntity": {
      "place": {
        "@type": "Place",
        "label": ""
      },
    }
  };

  const record = {
    "record": {},
    "mainEntity": {
      "place":
        {
          "@type": "AnotherPlaceType",
          "label": "Something"
        }
    }
  }

  const templatePath = ['mainEntity'];
  const changeList = getChangeList(template, record, templatePath, templatePath, null)

  expect(changeList).toEqual([
    {
      path: 'mainEntity.place',
      value:  [{
        "@type": "AnotherPlaceType",
        "label": "Something"
      }]
    },
    {
      path: 'mainEntity.place[1]',
      value: {
        "@type": "Place",
        "label": ""
      }
    }
  ]);
});

test('should NOP when target is array but not repeatable', () => {
  const template = {
    "record": {},
    "mainEntity": {
      "hasDimensions": {
          "@type": "Dimensions",
          "label": ""
        }
    }
  };

  const record = {
    "record": {},
    "mainEntity": {
      "hasDimensions": [
        {
          "@type": "Dimensions",
          "label": "22 cm"
        }
      ]
    }
  }
  const templatePath = ['mainEntity'];

  const changeList = getChangeList(template, record, templatePath, templatePath, null)

  expect(changeList).toEqual([]);
});

test('should add to list, not enrich', () => {
  const template = {
    "record": {},
    "mainEntity": {
      "hasNote": [
        {
          "@type": "Note",
          "label": "C"
        },
        {
          "@type": "Note",
          "label": "D"
        }
      ]
    }
  };

  const record = {
    "record": {},
    "mainEntity": {
      "hasNote": [
        {
          "@type": "Note",
          "label": "A"
        },
        {
          "@type": "Note",
          "label": "B"
        }
      ]
    }
  }
  const templatePath = ['mainEntity'];

  const changeList = getChangeList(template, record, templatePath, templatePath, null)

  expect(changeList).toEqual([
    {
      "path": "mainEntity.hasNote[2]",
      "value": {
        "@type": "Note",
        "label": "C",
      },
    },
    {
      "path": "mainEntity.hasNote[3]",
      "value": {
        "@type": "Note",
        "label": "D",
      },
    },
  ]);
});

test('should add hasVariant person to list', () => {
  const source = {
    "record": {},
    "mainEntity": {
      "hasVariant": [
      {
        "@type": "Person",
        "lifeSpan": "1980-",
        "givenName": "Eddie",
        "familyName": "Summanen"
      },
      {
        "@type": "Person",
        "lifeSpan": "1980-",
        "givenName": "E.",
        "familyName": "Summanen"
      }
  ]
    }
  };

  const record = {
    "record": {},
    "mainEntity": {
      "hasVariant": [
        {
          "@type": "Person",
          "lifeSpan": "1980-",
          "givenName": "Eddie",
          "familyName": "Summanen"
        }
      ]
    }
  }
  const templatePath = ['mainEntity'];

  const changeList = getChangeList(source, record, templatePath, templatePath, null)

  expect(changeList).toEqual([
    {
      "path": "mainEntity.hasVariant[1]",
      "value": {
        "@type": "Person",
        "lifeSpan": "1980-",
        "givenName": "E.",
        "familyName": "Summanen"
      }
    }
  ]);
});

test('should not enrich within skipped properties', () => {
  const skipIfPresent = ['language']
  const source = {
    "record": {},
    "mainEntity": {
      "language": [
        {
        "@id": "https://id.kb.se/language/nor"
        }
      ]
    }
  };

  const target = {
    "record": {},
    "mainEntity": {
      "language": [
        {
          "@id": "https://id.kb.se/language/swe"
        }
      ]
    }
  }

  const templatePath = ['mainEntity'];

  const changeList = getChangeList(source, target, templatePath, templatePath,  null, skipIfPresent);

  expect(changeList).toEqual([]);
});

test('should not enrich within role if present and instructed to skip', () => {
  const skipIfPresent = ['role', 'language']
  const source = {
    "record": {},
    "mainEntity": {
      "contribution": [
        {
          "@type": "PrimaryContribution",
          "agent": null,
          "role": [{"@id" : "https://id.kb.se/term/relator/author"}]
        }
      ],
      "language": [
        {
          "@id": "https://id.kb.se/language/nor"
        }
      ]
    }
  };

  const target = {
    "record": {},
    "mainEntity": {
      "contribution": [
        {
          "@type": "PrimaryContribution",
          "agent": null,
          "role": [{"@id" : "https://id.kb.se/term/relator/illustrator"}]
        }
      ],
      "language": [
        {
          "@id": "https://id.kb.se/language/nor"
        }
      ]
    }
  };

  const templatePath = ['mainEntity'];

  const changeList = getChangeList(source, target, templatePath, templatePath, null, skipIfPresent)

  expect(changeList).toEqual([]);
});

test('should enrich within role if empty but specified as skipped', () => {
  const skipIfPresent = ['role'];
  const source = {
    "record": {},
    "mainEntity": {
      "contribution": [
        {
          "@type": "PrimaryContribution",
          "agent": null,
          "role": [{"@id" : "https://id.kb.se/term/relator/illustrator"}]
        }
      ],
    }
  };

  const target = {
    "record": {},
    "mainEntity": {
      "contribution": [
        {
          "@type": "PrimaryContribution",
          "agent": null,
          "role": []
        }
      ],
    }
  };

  const templatePath = ['mainEntity'];

  const changeList = getChangeList(source, target, templatePath, templatePath,  null, skipIfPresent)

  expect(changeList).toEqual([
    {
      "path": "mainEntity.contribution[0].role[0]",
      "value": {
      "@id": "https://id.kb.se/term/relator/illustrator"
      },
    },
  ]);
});

test('should not overwrite place with empty label', () => {
  const source = {
    "record": {},
    "mainEntity": {
      "place": [{
        "@type": "Place",
        "label": ""
      }],
    }
  };

  const target = {
    "record": {},
    "mainEntity": {
      "place":
          {
            "@type": "Place",
            "label": "Something"
          }

    }
  }

  const templatePath = ['mainEntity'];
  const changeList = getChangeList(source, target, templatePath, templatePath, null)

  //The only change is that a repeatable property is converted to an array
  expect(changeList).toEqual([{
    "path": "mainEntity.place",
    "value": [{
      "@type": "Place",
      "label": "Something"
    }]
  }]);
});
