const ID = '@id';
const TYPE = '@type';
const GRAPH = '@graph';

function asArray(value) {
  if (Array.isArray(value)) return value;
  return value != null ? [value] : [];
}

// Additional encoding for following special chars: []()!'*
// in order to sync with backend encoded uris
function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16)}`);
}

export default class URIMinter {
  constructor(containers) {
    this.containerMap = {};
    for (const container of containers) {
      if (container[TYPE] !== 'EntityContainer') {
        continue;
      }
      for (const type of asArray(container.memberClass)) {
        let byMemberOf = this.containerMap[type];
        if (!byMemberOf) {
          byMemberOf = {};
          this.containerMap[type] = byMemberOf;
        }
        let byResource = byMemberOf[container.isMemberOfRelation];
        if (!byResource) {
          byResource = {};
          byMemberOf[container.isMemberOfRelation] = byResource;
        }
        byResource[container.membershipResource[ID]] = container;

        const existing = this.containerMap[type];
        if (typeof existing === 'undefined') {
          this.containerMap[type] = byMemberOf;
        } else {
          Object.assign(byMemberOf, existing);
        }
      }
    }
  }

  findContainerForEntity(mainEntity, library) {
    let containerRelationMap;
    for (const type of asArray(mainEntity[TYPE])) {
      containerRelationMap = this.containerMap[type];
      if (containerRelationMap) break;
    }
    if (!containerRelationMap) {
      return null;
    }
    for (const relation of Object.keys(containerRelationMap)) {
      const containerMemberMap = containerRelationMap[relation];
      if (mainEntity.hasOwnProperty(relation) && mainEntity[relation] !== null) {
        let relationId = mainEntity[relation][ID];
        if (Array.isArray(mainEntity[relation])) {
          const len = mainEntity[relation].length;
          if (len !== 1) {
            throw new Error(`Unexpected number of values for: ${relation}: ${len}`);
          }
          relationId = mainEntity[relation][0][ID];
        }
        const container = containerMemberMap[relationId];
        if (container) {
          if (container.administeredBy.find((it) => it[ID] === library[ID])) {
            return container;
          }
        }
      }
    }
    return null;
  }

  assignUri(data, library) {
    const [record, mainEntity] = data[GRAPH];

    const container = this.findContainerForEntity(mainEntity, library);
    if (container == null) {
      throw new Error(`<${library[ID]}> cannot assign URI for <${mainEntity[ID]}>`);
    }

    const slugValue = mainEntity[container.slugProperty];
    if (!slugValue) {
      throw new Error(`Missing slugProperty ${container.slugProperty} for ${mainEntity[ID]}`);
    }

    const uri = container[ID] + fixedEncodeURIComponent(slugValue.trim());

    let sameAs = mainEntity.sameAs ? asArray(mainEntity.sameAs) : [];
    if (!sameAs.find((it) => it[ID] === mainEntity[ID])) {
      sameAs.push({ [ID]: mainEntity[ID] });
      sameAs = sameAs.filter((it) => it[ID] !== uri);
      mainEntity.sameAs = sameAs;
    }
    mainEntity[ID] = uri;
    record.mainEntity[ID] = uri;
  }
}
