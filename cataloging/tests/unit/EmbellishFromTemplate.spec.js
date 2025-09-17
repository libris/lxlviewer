import {getChangeList} from "@/utils/embellish";

// const getLabel = (s) => `L:${s}`;

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
      "test" : {}
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
      path: 'mainEntity.test',
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
