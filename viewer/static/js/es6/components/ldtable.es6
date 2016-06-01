import * as _ from 'lodash';
import LinkAdder from './linkadder';
import DataNode from './datanode';
import LinkedItem from './linkeditem';

export default {
  template: '#ld-table',
  props: {
    focus: {},
    vocab: {},
    linked: {},
    vocabPfx: {},
  },
  computed: {
    allowedProperties() {
      const props = [];
      const vocabItems = this.vocab.descriptions;
      const self = this;

      function getClassFromVocab(classname) {
        return _.find(vocabItems, { '@id': classname });
      }

      function getBaseClasses(classObj) {
        let items = [];
        if (classObj && classObj.hasOwnProperty('subClassOf')) {
          for (let i = 0; i < classObj.subClassOf.length; i++) {
            const baseClassId = classObj.subClassOf[i]['@id'];
            const baseClass = getClassFromVocab(baseClassId);
            if (
              baseClass &&
              baseClass.isDefinedBy &&
              baseClass.isDefinedBy['@id'] === self.vocabPfx
            ) {
              items = items.concat(getBaseClasses(baseClass));
              items.push(baseClass);
            }
          }
        }
        return items;
      }

      // Types defined on the item
      const types = [].concat(this.focus['@type']);

      // Find their base classes
      let classes = [];
      for (let t = 0; t < types.length; t++) {
        classes = classes.concat(getBaseClasses(getClassFromVocab(this.vocabPfx + types[t])));
      }
      const classNames = [];
      for (let i = 0; i < types.length; i++) {
        classNames.push(`${this.vocabPfx}${types[i]}`);
      }
      for (let i = 0; i < classes.length; i++) {
        classNames.push(classes[i]['@id']);
      }
      // Get the properties
      for (let i = 0; i < vocabItems.length; i++) {
        if (vocabItems[i] && vocabItems[i].hasOwnProperty('domainIncludes')) {
          for (let t = 0; t < vocabItems[i].domainIncludes.length; t++) {
            const type = vocabItems[i].domainIncludes[t]['@id'];
            const prop = vocabItems[i];
            if (
              classNames.indexOf(type) !== -1 &&
              props.filter((p) => p['@id'] === prop['@id']).length === 0
            ) {
              props.push(prop);
            }
          }
        }
      }
      return props;
    },
  },
  methods: {
    isArray(o) {
      return _.isArray(o);
    },
    isPlainObject(o) {
      return _.isPlainObject(o);
    },
    removeItem(key, item) {
      const keyWithout = _.reject(this.focus[key], (o) => o === item);
      const modified = this.focus;
      modified[key] = keyWithout;
      this.focus = Object.assign({}, this.focus, modified);
    },
    addItem(key, item) {
      this.linked.push(item);
      const modified = this.focus;
      const newItem = { '@id': item['@id'] };
      modified[key].push(newItem);
      this.focus = Object.assign({}, this.focus, modified);
    },
    addAnonymous(key, item) {
      const modified = this.focus;
      if (_.isArray(modified[key])) {
        modified[key].push(item);
      } else {
        modified[key] = item;
      }
      this.focus = Object.assign(this.focus, modified);
    },
    isEmpty(value) {
      return Object.keys(value).length === 0;
    },
    addField(prop) {
      const newItem = {};
      const key = prop['@id'].replace(this.vocabPfx, '');
      if (prop['@type'].indexOf('ObjectProperty') !== -1) {
        newItem[key] = [];
      } else {
        newItem[key] = '';
      }
      this.focus = Object.assign({}, this.focus, newItem);
    },
    updateValue(key, value) {
      console.log("Updating", key, value);
      this.focus[key] = value;
    },
  },
  components: {
    'link-adder': LinkAdder,
    'data-node': DataNode,
    'linked-item': LinkedItem,
  },
};
