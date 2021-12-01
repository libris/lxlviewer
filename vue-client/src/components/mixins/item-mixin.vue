<script>
import { cloneDeep, isArray, get, isObject, dropRight } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as VocabUtil from 'lxljs/vocab';
import * as StringUtil from 'lxljs/string';
import * as DataUtil from '@/utils/data';
import * as RecordUtil from '@/utils/record';

export default {
  props: {
    parentPath: {
      type: String,
      default: '',
    },
    fieldKey: {
      type: String,
      default: '',
    },
    isCompositional: {
      type: Boolean,
      default: false,
    },
    hoverLinks: {
      type: Boolean,
      default: false,
    },
    index: Number,
  },
  data() {
    return {
      removed: false,
    };
  },
  methods: {
    removeThis(animate = false) {
      let parentValue = cloneDeep(get(this.inspector.data, this.parentPath));
      if (isArray(parentValue)) {
        parentValue.splice(this.index, 1);
      } else {
        parentValue = null;
      }
      if (animate) {
        this.$store.dispatch('setInspectorStatusValue', { property: 'removing', value: true });
        this.removed = true;
        setTimeout(() => {
          this.$store.dispatch('updateInspectorData', {
            changeList: [
              {
                path: `${this.parentPath}`,
                value: parentValue,
              },
            ],
            addToHistory: true,
          });
        }, 500);
      } else {
        this.$store.dispatch('updateInspectorData', {
          changeList: [
            {
              path: `${this.parentPath}`,
              value: parentValue,
            },
          ],
          addToHistory: true,
        });
      }
    },
  },
  events: {
    'remove-entity'() {
      this.removeThis();
    },
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
    path() {
      const parentValue = get(this.inspector.data, this.parentPath);
      if (isArray(parentValue)) {
        return `${this.parentPath}[${this.index}]`;
      }
      return `${this.parentPath}`;
    },
    inClassAndProperty() {
      return `${this.entityType}.${this.fieldKey}`;
    },
    extractedMainEntity() {
      const cleanObj = DataUtil.removeNullValues(this.focusData);
      if (VocabUtil.isSubClassOf(this.focusData['@type'], 'Work', this.resources.vocabClasses, this.resources.context)) {
        // Entity is of type Work or derived type
        if (this.focusData.hasOwnProperty('hasTitle') === false) {
          let titleOnInstance = null;
          const mainEntity = this.inspector.data.mainEntity;
          if (mainEntity.hasOwnProperty('hasTitle')) {
            const hasTitle = mainEntity.hasTitle;
            for (let i = 0; i < hasTitle.length; i++) {
              if (hasTitle[i]['@type'] === 'Title') {
                const titleObj = cloneDeep(hasTitle[i]);
                titleObj.source = [{ '@id': mainEntity['@id'] }];
                titleOnInstance = titleObj;
                break;
              }
            }
          }
          if (titleOnInstance != null) {
            cleanObj.hasTitle = [titleOnInstance];
          }
        }
      }
      return cleanObj;
    },
    extractedItem() {
      if (this.focusData.hasOwnProperty('@type') === false) {
        return null;
      }
      const newRecord = {};
      newRecord.descriptionCreator = { '@id': this.user.getActiveLibraryUri() };
      if (this.inspector.data.record['@id'] !== 'https://id.kb.se/TEMPID') {
        newRecord.derivedFrom = { '@id': this.inspector.data.record['@id'] };
      }
      const objAsRecord = RecordUtil.getObjectAsRecord(this.extractedMainEntity, newRecord);
      return objAsRecord;
    },
    isExtractable() {
      if (this.isCompositional === true) {
        return false;
      }
      const classId = StringUtil.getCompactUri(this.item['@type'], this.resources.context);
      if (VocabUtil.isExtractable(classId, this.resources.vocab, this.settings, this.resources.context)) {
        return true;
      }
      return false;
    },
    isEmbedded() {
      return VocabUtil.isEmbedded(this.item['@type'], this.resources.vocab, this.settings, this.resources.context);
    },
    focusData() {
      if (!this.item['@id']) {
        return this.item;
      }
      if (isArray(this.item) || !isObject(this.item)) {
        throw new Error('Item is not an object.');
      }
      // If items have more than one key, consider them already embellished
      if (Object.keys(this.item).length > 1) {
        return this.item;
      }
      // Is link to self
      if (this.inspector.data.hasOwnProperty('mainEntity')
        && this.item['@id'] === this.inspector.data.mainEntity['@id']) {
        return this.inspector.data.mainEntity;
      }
      // Is link to other
      return DataUtil.getEmbellished(
        this.item['@id'],
        this.inspector.data.quoted,
      );
    },
    recordId() {
      if (this.inspector.data.hasOwnProperty('mainEntity')
        && this.inspector.data.mainEntity['@id'] === this.focusData['@id']) {
        return this.inspector.data.record['@id'];
      }
      return RecordUtil.getRecordId(this.focusData, this.inspector.data.quoted);
    },
    recordType() {
      return RecordUtil.getRecordType(this.focusData, this.inspector.data.quoted);
    },
    isLibrisResource() {
      return StringUtil.isLibrisResourceUri(this.recordId, this.settings);
    },
    routerPath() {
      const uriParts = this.recordId.split('/');
      const fnurgel = uriParts[uriParts.length - 1];
      return `/${fnurgel}`;
    },
    actualParentPath() {
      return dropRight(this.path.split('.')).join('.');
    },
  },
  watch: {
    'status.removing': {
      handler(newValue) {
        if (!newValue) {
          this.removed = false;
        }
      },
    },
  },
};
</script>
