import * as _ from 'lodash';
import LinkAdder from './linkadder';
import ProcessedLabel from './processedlabel';

export default {
  template: '#ld-table',
  props: {
    item: {},
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
            if (baseClass && baseClass.isDefinedBy['@id'] === self.vocabPfx) {
              items = items.concat(getBaseClasses(baseClass));
              items.push(baseClass);
            }
          }
        }
        return items;
      }

      // Types defined on the item
      const types = [].concat(this.item['@type']);

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
    addItem(key, item) {
      this.$parent.addItem(key, item);
    },
    addField(key) {
      const newItem = {};
      newItem[key.replace(this.vocabPfx, '')] = '';
      this.$parent.thing = Object.assign({}, this.item, newItem);
    },
    removeItem(key, item) {
      this.$parent.removeItem(key, item);
    },
    updateValue(key, value) {
      this.item[key] = value;
      console.log("Updated", key, this.item[key]);
    },
  },
  components: {
    'link-adder': LinkAdder,
    'data-node': {
      template: '#data-node',
      name: 'data-node',
      props: ['key', 'value', 'index', 'label'],
      components: {
        'processed-label': ProcessedLabel,
      },
      methods: {
        getLinked(id) {
          const index = this.index;
          if (typeof index === 'undefined') {
            return {};
          }
          for (let i = 0; i < index.length; i ++) {
            if (index[i]['@id'] === id) {
              return index[i];1
            }
          }
          return id;
        },
        isMarc(key) {
          if (typeof key === 'undefined') {
            return false;
          }
          return (
            !!~key.indexOf('marc:') || !!~key.indexOf('_marc')
          );
        },
        updateValue(key, value) {
          this.$parent.updateValue(key, value);
        },
        isEditable(key) {
          const tempNotEditable = [
            '@id',
            '@type',
            'controlNumber',
            'systemNumber',
            'created',
            'modified',
          ];
          return !~tempNotEditable.indexOf(key);
        },
        isArray(o) {
          return _.isArray(o);
        },
        isPlainObject(o) {
          return _.isPlainObject(o);
        },
        removeItem(key, value) {
          return this.$parent.removeItem(key, value);
        },
      },
    },
  },
};
