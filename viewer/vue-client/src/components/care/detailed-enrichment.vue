<script>
import { mapGetters, mapActions } from 'vuex';
import { difference, intersection, cloneDeep, isArray, union, isEqual, uniq } from 'lodash-es';
import * as StringUtil from '@/utils/string';
import * as VocabUtil from '@/utils/vocab';
import * as DisplayUtil from '@/utils/display';
import Field from '@/components/inspector/field';
import TabMenu from '@/components/shared/tab-menu';
import EntitySummary from '@/components/shared/entity-summary';

export default {
  name: 'DetailedEnrichment',
  props: {
  },
  components: {
    'field': Field,
    'tab-menu': TabMenu,
    'entity-summary': EntitySummary,
  },
  data() {
    return {
      selected: [],
      formFocus: 'mainEntity',
      resultObject: null,
    };
  },
  computed: {
    ...mapGetters([
      'enrichment',
      'settings',
      'user',
      'resources',
    ]),
    recordType() {
      return this.enrichment.data.source.mainEntity['@type'];
    },
    formTabs() {
      return [
        { id: 'mainEntity', text: this.$options.filters.labelByLang(this.recordType) },
        { id: 'record', text: 'Admin metadata' },
      ];
    },
    allKeys() {
      const sourceKeys = Object.keys(this.enrichment.data.source[this.formFocus]);
      const targetKeys = Object.keys(this.enrichment.data.target[this.formFocus]);
      const allKeys = union(sourceKeys, targetKeys);
      return allKeys;
    },
    sortedKeys() {
      const sourceDisplay = DisplayUtil.getSortedProperties(this.recordType, this.enrichment.data.source[this.formFocus], this.settings, this.resources);
      const targetDisplay = DisplayUtil.getSortedProperties(this.recordType, this.enrichment.data.target[this.formFocus], this.settings, this.resources);
      const bothSorted = union(sourceDisplay, targetDisplay);

      return intersection(bothSorted, this.allKeys); // Important not to switch order of these params, since we sort on the first
    },
    source() {
      return this.enrichment.data.source[this.formFocus];
    },
    target() {
      return this.enrichment.data.target[this.formFocus];
    },
    result() {
      return this.resultObject[this.formFocus];
    },
    diffingArrayValues() {
      const diffMap = {};
      for (let i = 0; i < this.existingKeys.length; i++) {
        // Loop over existing keys
        if (isArray(this.source[this.existingKeys[i]])) {
          // Case for arrays
          const nodeSourceArray = this.source[this.existingKeys[i]];
          const nodeTargetArray = this.target[this.existingKeys[i]];
          for (let x = 0; x < nodeSourceArray.length; x++) {
            // Loop over a value that is an array
            const nodeValue = nodeSourceArray[x];
            if (nodeTargetArray.indexOf(nodeValue) < 0) {
              if (typeof diffMap[this.existingKeys[i]] === 'undefined') {
                diffMap[this.existingKeys[i]] = [];
              }
              diffMap[this.existingKeys[i]].push(nodeValue);
            }
          }
        }
      }
      return diffMap;
    },
    newKeys() {
      const target = this.enrichment.data.target[this.formFocus];
      const result = this.resultObject[this.formFocus];
      const targetKeys = Object.keys(target);
      const resultKeys = Object.keys(result);
      return difference(resultKeys, targetKeys);
    },
    diffingKeys() {
      const diffList = [];
      for (let i = 0; i < this.existingKeys.length; i++) {
        // Loop over existing keys
        if (this.source[this.existingKeys[i]] !== this.target[this.existingKeys[i]]) {
          diffList.push(this.existingKeys[i]);
        }
      }
      return diffList;
    },
    changedKeys() {
      const changedKeyList = [];
      for (let i = 0; i < this.allKeys.length; i++) {
        if (this.target[this.allKeys[i]] !== this.result[this.allKeys[i]]) {
          changedKeyList.push(this.allKeys[i]);
        }
      }
      return changedKeyList;
    },
    missingKeys() {
      return difference(Object.keys(this.source), Object.keys(this.target));
    },
    equalKeys() {
      return difference(this.existingKeys, this.diffingKeys);
    },
    existingKeys() {
      return intersection(Object.keys(this.source), Object.keys(this.target));
    },
    diff() {
      return {
        diffingArrayValues: this.diffingArrayValues,
        diffingKeys: this.diffingKeys,
        missingKeys: this.missingKeys,
        existingKeys: this.existingKeys,
        equalKeys: this.equalKeys,
      };
    },
  },
  watch: {
  },
  methods: {
    ...mapActions([
      'setEnrichmentResult',
    ]),
    confirm() {
      this.setEnrichmentResult(this.resultObject);
    },
    setFocus(focus) {
      this.formFocus = focus;
    },
    isDiffing(key) {
      const equal = isEqual(this.target[key], this.result[key]);
      return equal === false;
    },
    addValue(key) {
      console.log("Add value:", key);
      const source = this.enrichment.data.source;
      if (this.resultObject[this.formFocus].hasOwnProperty(key) === false) {
        this.$set(this.resultObject[this.formFocus], key, source[this.formFocus][key]);
      } else {
        let resultValue = this.resultObject[this.formFocus][key];
        if (isArray(resultValue) === false) {
          resultValue = [resultValue];
        }
        let sourceValue = source[this.formFocus][key];
        if (isArray(sourceValue) === false) {
          sourceValue = [sourceValue];
        }
        const concatenatedUnique = uniq(resultValue.concat(sourceValue));
        this.$set(this.resultObject[this.formFocus], key, concatenatedUnique);
      }
    },
    replaceValue(key) {
      console.log("Replace value:", key);
      const source = this.enrichment.data.source;
      this.resultObject[this.formFocus][key] = source[this.formFocus][key];
    },
    canBeDiffReplaced(key) {
      if (this.diff.diffingKeys.indexOf(key) > -1) {
        return true;
      }
      return false;
    },
    hasNoDiff(key) {
      if (this.inEnrichment) {
        if (this.diff.equalKeys.indexOf(key) > -1) {
          return true;
        }
      }
      return false;
    },
    canBeDiffAdded(key) {
      const test = this.diff.missingKeys.indexOf(key);
      if (this.diff.missingKeys.indexOf(key) > - 1) {
        return true;
      }
      if (this.isRepeatable(key)) {
        return true;
      }
      return false;
    },
    isRepeatable(key) {
      return VocabUtil.propIsRepeatable(key, this.resources.context);
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.resultObject = cloneDeep(this.enrichment.data.target);
    });
  },

};
</script>

<template>
  <div class="DetailedEnrichment">
    <tab-menu @go="setFocus" :tabs="formTabs" :active="formFocus" />
    <div class="DetailedEnrichment-rowContainer" v-if="resultObject">
      <div class="DetailedEnrichment-row" v-for="key in sortedKeys" :key="key">
        <div class="DetailedEnrichment-labelContainer uppercaseHeading">
          {{ key | labelByLang | capitalize }}
        </div>
        <div class="DetailedEnrichment-fieldRow">
          <div class="DetailedEnrichment-sourceField">
            <field class="FieldList-item"
              v-if="enrichment.data.source[formFocus].hasOwnProperty(key)"
              v-bind:class="{ 'locked': true }" 
              :entity-type="enrichment.data.source[formFocus]['@type']" 
              :is-inner="false" 
              :is-removable="false" 
              :is-locked="true" 
              :show-key="false"
              :field-key="key" 
              :field-value="enrichment.data.source[formFocus][key]" 
              :parent-path="formFocus" />
          </div>
          <div class="DetailedEnrichment-buttonContainer">
            <div class="Field-actions">
              <div class="Field-action">
                <i role="button" tabindex="0" v-if="canBeDiffAdded(key)" @click="addValue(key)" class="fa fa-fw text-success fa-plus-square action-button icon icon--sm"></i>
                Utöka
              </div>
              <div class="Field-action">
                <i role="button" tabindex="0" v-if="canBeDiffReplaced(key)" @click="replaceValue(key)" class="fa fa-fw fa-arrow-circle-o-right text-warning action-button icon icon--sm"></i>
                Ersätt
              </div>
            </div>
          </div>
          <div class="DetailedEnrichment-resultField">
            <field class="FieldList-item"
              v-if="resultObject !== null && resultObject[formFocus].hasOwnProperty(key)"
              v-bind:class="{ 'locked': true }" 
              :entity-type="resultObject[formFocus]['@type']" 
              :is-inner="false" 
              :is-removable="false" 
              :is-locked="true" 
              :show-key="false"
              :show-diffs="true"
              :field-key="key" 
              :field-value="resultObject[formFocus][key]" 
              :old-value="enrichment.data.target[formFocus][key]"
              :is-diff="isDiffing(key)"
              :is-new="newKeys.indexOf(key) > -1"
              :parent-path="formFocus" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">

.DetailedEnrichment {
  width: 100%;
  height: 80vh;
  padding: 0 1em;
  overflow-y: scroll;
  &-table {
    width: 100%;
    td {
      vertical-align: top;
    }
    .Field {
      border-width: 1px;
    }
  }
  &-rowContainer {
    width: 100%;
  }
  &-row {
    width: 100%;
  }
  &-fieldRow {
    width: 100%;
    display: flex;
    border: 1px solid;
  }
  &-sourceField, &-resultField {
    flex-basis: 45%;
  }
  &-sourceField, &-resultField, &-buttonContainer {
    border: 1px solid;
    display: flex;
  }
  &-buttonContainer {
    flex-basis: 10%;
    .Field-actions {
      display: flex;
      flex-direction: column;
      .Field-action {
        width: 100%;
        border: 1px solid;
      }
    }
  }

}

</style>
