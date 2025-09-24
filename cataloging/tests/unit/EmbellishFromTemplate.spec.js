import {getChangeList} from "@/utils/embellish";

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

  const changeList = getChangeList(template, record, templatePath)

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

test('should handle nested properties', () => {
  const template = {
    "record": {},
    "mainEntity": {
      "seriesMembership": [
        {
          "@type": "SeriesMembership",
          "inSeries": {
            "@type": "Instance",
            "identifiedBy": [
              {
                "@type": "ISSN",
                "value": ""
              }
            ]
          }
        }
      ]
    }
  };

  const record = {
    "record": {},
    "mainEntity": {
      "seriesMembership": [
        {
          "@type": "SeriesMembership",
          "inSeries": {
            "@type": "Instance"
          }
        }
      ]
    }
  }
  const templatePath = ['mainEntity'];

  const changeList = getChangeList(template, record, templatePath)

  expect(changeList).toEqual([
      {
        path: 'mainEntity.seriesMembership[0].inSeries.identifiedBy',
        value:[{"@type": "ISSN", "value": ""}]
      },
    ]
  );
});

test("Should not treat '@id' as a regular property", () => {
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


