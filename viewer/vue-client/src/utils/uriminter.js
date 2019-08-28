const ID = '@id';
const TYPE = '@type';
const GRAPH = '@graph';

function asArray(value) {
  if (Array.isArray(value)) return value;
  return value != null ? [value] : [];
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
    for (const relation in containerRelationMap) {
      if (Object.hasOwnProperty(containerRelationMap)) {
        continue;
      }
      const containerMemberMap = containerRelationMap[relation];
      const container = containerMemberMap[mainEntity[relation][ID]];
      if (container) {
        if (container.administeredBy.find(it => it[ID] === library[ID])) {
          return container;
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

    const uri = container[ID] + encodeURIComponent(slugValue);

    let sameAs = mainEntity.sameAs ? asArray(mainEntity.sameAs) : [];
    if (!sameAs.find(it => it[ID] === mainEntity[ID])) {
      sameAs.push({ [ID]: mainEntity[ID] });
      sameAs = sameAs.filter(it => it[ID] !== uri);
      mainEntity.sameAs = sameAs;
    }
    mainEntity[ID] = uri;
    record.mainEntity[ID] = uri;
  }
}
