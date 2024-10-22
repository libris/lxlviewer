<script>
import { cloneDeep, isArray, get, isObject, dropRight, isEqual } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as VocabUtil from 'lxljs/vocab';
import * as StringUtil from 'lxljs/string';
import * as DataUtil from '@/utils/data';
import * as RecordUtil from '@/utils/record';
import { DELETE_ON_SAVE } from "@/store";

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
    diff: {
      type: Object,
      default: null,
    },
    index: Number,
  },
  data() {
    return {
      removed: false,
    };
  },
  methods: {
    removeThis(animate = false, extraChangeList = []) {
      let parentValue = cloneDeep(get(this.inspector.data, this.parentPath));
      if (isArray(parentValue)) {
        parentValue.splice(this.index, 1);
      } else {
        parentValue = null;
      }
      const changeList = [
        {
          path: `${this.parentPath}`,
          value: parentValue,
        },
      ];
      changeList.push(...extraChangeList);
      if (animate) {
        this.$store.dispatch('setInspectorStatusValue', { property: 'removing', value: true });
        this.removed = true;
        setTimeout(() => {
          this.$store.dispatch('updateInspectorData', {
            changeList: changeList,
            addToHistory: true,
          });
        }, 500);
      } else {
        this.$store.dispatch('updateInspectorData', {
          changeList: changeList,
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
    diffAdded() {
      if (this.diff == null) return false;
      return this.diff.added.includes(this.myPath);
    },
    diffRemoved() {
      if (this.diff == null) return false;
      return this.diff.removed.includes(this.myPath);
    },
    diffModified() {
      if (this.diff == null) return false;
      return this.diff.modified.includes(this.myPath);
    },
    myPath() {
      return this.index !== undefined
        ? `${this.parentPath}[${this.index}]`
        : this.path;
    },
    diffAddedChildren() {
      if (this.diff == null) return false;
      return this.diff.added
        .filter((p) => !isEqual(p, this.path))
        .some((p) => p.includes(this.path));
    },
    diffRemovedChildren() {
      if (this.diff == null) return false;
      return this.diff.removed
        .filter((p) => !isEqual(p, this.path))
        .some((p) => p.includes(this.path));
    },
    diffModifiedChildren() {
      if (this.diff == null) return false;
      return this.diff.modified
        .filter((p) => !isEqual(p, this.path))
        .some((p) => p.includes(this.path));
    },
    diffChangedChildren() {
      return this.diffAddedChildren || this.diffRemovedChildren || this.diffModifiedChildren;
    },
    inClassAndProperty() {
      return `${this.entityType}.${this.fieldKey}`;
    },
    extractedMainEntity() {
      return RecordUtil.getCleanedExtractedData(this.focusData, this.inspector.data, this.resources, this.settings);
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

      if (this.recordType === 'BulkChange') {
        return `/directory-care/bulkchanges/${fnurgel}`;
      }

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
