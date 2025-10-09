<script>
import { mapGetters, mapActions } from 'vuex';
import { difference, intersection, cloneDeep, isArray, union, isEqual, uniqWith, remove } from 'lodash-es';
import * as VocabUtil from 'lxljs/vocab';
import * as DisplayUtil from 'lxljs/display';
import { translatePhrase, labelByLang, capitalize } from '@/utils/filters';
import Field from '@/components/inspector/field.vue';
import Button from '@/components/shared/button.vue';
import TabMenu from '@/components/shared/tab-menu.vue';
import EntitySummary from '@/components/shared/entity-summary.vue';

export default {
  name: 'MergeView',
  props: {
    floatingDialogs: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    'tab-menu': TabMenu,
    'entity-summary': EntitySummary,
    'button-component': Button,
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
      'inspector',
      'user',
      'resources',
    ]),
    recordType() {
      return this.enrichment.data.source.mainEntity['@type'];
    },
    formTabs() {
      return [
        { id: 'mainEntity', text: labelByLang(this.recordType) },
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
    filteredKeys() {
      const filteredKeys = this.sortedKeys;
      // filter out keys we don't want in enrichment form
      remove(filteredKeys, (e) => e === '@reverse');
      return filteredKeys;
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
          let nodeTargetArray = this.target[this.existingKeys[i]];
          if (isArray(nodeTargetArray) === false) {
            nodeTargetArray = [nodeTargetArray];
          }
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
    modifiedKeys() {
      const resultKeys = Object.keys(this.result);
      const list = [];
      for (let i = 0; i < resultKeys.length; i++) {
        if (this.target.hasOwnProperty(resultKeys[i]) === false) {
          list.push(resultKeys[i]);
        } else if (isEqual(this.target[resultKeys[i]], this.result[resultKeys[i]]) === false) {
          list.push(resultKeys[i]);
        }
      }
      return list;
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
      const list = [];
      for (let i = 0; i < this.existingKeys.length; i++) {
        if (isEqual(this.source[this.existingKeys[i]], this.result[this.existingKeys[i]])) {
          list.push(this.existingKeys[i]);
        }
      }
      return list;
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
    translatePhrase,
    labelByLang,
    capitalize,
    ...mapActions([
      'setEnrichmentResult',
    ]),
    confirm() {
      this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: '',
            value: this.resultObject,
          },
        ],
        addToHistory: true,
      });
      this.close();
    },
    close() {
      const detailedEnrichmentModal = this.inspector.status.detailedEnrichmentModal;
      detailedEnrichmentModal.open = false;
      this.$store.dispatch('setInspectorStatusValue', { property: 'detailedEnrichmentModal', value: detailedEnrichmentModal });
    },
    cancel() {
      this.close();
    },
    setFocus(focus) {
      this.formFocus = focus;
    },
    isDiffing(key) {
      const equal = isEqual(this.target[key], this.result[key]);
      return equal === false;
    },
    undo(key) {
      if (this.target.hasOwnProperty(key)) {
        this.resultObject[this.formFocus][key] = this.target[key];
      } else {
        delete this.resultObject[this.formFocus][key];
      }
    },
    addValue(key) {
      // console.log("Add value:", key);
      const source = this.enrichment.data.source;
      if (this.resultObject[this.formFocus].hasOwnProperty(key) === false) {
        this.resultObject[this.formFocus][key] = source[this.formFocus][key];
      } else {
        let resultValue = this.resultObject[this.formFocus][key];
        if (isArray(resultValue) === false) {
          resultValue = [resultValue];
        }
        let sourceValue = source[this.formFocus][key];
        if (isArray(sourceValue) === false) {
          sourceValue = [sourceValue];
        }
        const concatenatedList = resultValue.concat(sourceValue);
        const concatenatedUnique = uniqWith(concatenatedList, isEqual);
        this.$set(this.resultObject[this.formFocus], key, concatenatedUnique);
      }
    },
    replaceValue(key) {
      // console.log("Replace value:", key);
      const source = this.enrichment.data.source;
      this.resultObject[this.formFocus][key] = source[this.formFocus][key];
    },
    canBeDiffReplaced(key) {
      if (this.equalKeys.indexOf(key) > -1) {
        return false;
      }
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
      if (this.source.hasOwnProperty(key) === false) {
        return false;
      }
      if (this.equalKeys.indexOf(key) > -1) {
        return false;
      }
      if (this.diff.missingKeys.indexOf(key) > -1) {
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
  <div class="DetailedEnrichment" :class="{ 'with-floating-dialog': floatingDialogs }">
    <div class="DetailedEnrichment-rowContainer" v-if="resultObject">
      <div class="DetailedEnrichment-row">
        <div class="DetailedEnrichment-fieldRow">
          <div class="DetailedEnrichment-columnHeader sourceColumn">
            <div class="DetailedEnrichment-summaryLabel">
              {{ translatePhrase('Enrich from') }}
            </div>
            <div class="DetailedEnrichment-summaryContainer">
              <entity-summary
                :focus-data="enrichment.data.source['mainEntity']"
                :should-link="false"
                :exclude-components="[]" />
            </div>
          </div>
          <div class="DetailedEnrichment-actionHeader actionColumn" />
          <div class="DetailedEnrichment-columnHeader resultColumn non-existing">
            <div class="DetailedEnrichment-summaryLabel">
              {{ translatePhrase('Result') }}
            </div>
            <div class="DetailedEnrichment-summaryContainer">
              <entity-summary
                :focus-data="resultObject['mainEntity']"
                :should-link="false"
                :exclude-components="[]" />
            </div>
          </div>
        </div>
      </div>
      <tab-menu @go="setFocus" :tabs="formTabs" :active="formFocus" />
      <div class="DetailedEnrichment-row" v-for="key in filteredKeys" :key="key">
        <div class="DetailedEnrichment-labelContainer uppercaseHeading">
          <div v-show="key !== '@type'" class="DetailedEnrichment-label sourceColumn">
            {{ capitalize(labelByLang(key)) }}
          </div>
          <div v-show="key === '@type'" class="DetailedEnrichment-label sourceColumn">
            {{ capitalize(translatePhrase('Type')) }}
          </div>
          <div class="DetailedEnrichment-label actionColumn" />
          <div v-show="key !== '@type'" class="DetailedEnrichment-label resultColumn">
            {{ capitalize(labelByLang(key)) }}
          </div>
          <div v-show="key === '@type'" class="DetailedEnrichment-label resultColumn">
            {{ capitalize(translatePhrase('Type')) }}
          </div>
        </div>
        <div class="DetailedEnrichment-fieldRow">
          <div class="DetailedEnrichment-sourceField sourceColumn" :class="{ 'non-existing': source.hasOwnProperty(key) === false }">
            <field
              class="FieldList-item"
              v-if="enrichment.data.source[formFocus].hasOwnProperty(key)"
              v-bind:class="{ locked: true }"
              :entity-type="enrichment.data.source[formFocus]['@type']"
              :is-inner="false"
              :is-removable="false"
              :is-locked="true"
              :show-key="false"
              :field-key="key"
              :field-value="enrichment.data.source[formFocus][key]"
              :parent-path="formFocus" />
          </div>
          <div class="DetailedEnrichment-buttonContainer actionColumn">
            <div
              class="DetailedEnrichment-buttons"
              v-if="settings.lockedProperties.indexOf(key) === -1">
              <button-component
                :inverted="true"
                class="Button-default"
                @click="addValue(key)"
                :label="'Extend'"
                icon="plus"
                size="large"
                :disabled="canBeDiffAdded(key) === false"
                v-if="modifiedKeys.indexOf(key) === -1" />
              <button-component
                :inverted="true"
                class="Button-accent3"
                @click="replaceValue(key)"
                :label="'Replace'"
                icon="arrow-right"
                size="large"
                :disabled="canBeDiffReplaced(key) === false"
                v-if="modifiedKeys.indexOf(key) === -1" />
              <button-component
                :inverted="true"
                class="Button-info"
                @click="undo(key)"
                icon="undo"
                :label="'Undo'"
                size="large"
                v-if="modifiedKeys.indexOf(key) > -1" />
            </div>
          </div>
          <div
            class="DetailedEnrichment-resultField resultColumn"
            :class="{ 'non-existing': result.hasOwnProperty(key) === false, 'is-diff': isDiffing(key), 'is-new': newKeys.indexOf(key) > -1 }">
            <field
              class="FieldList-item"
              v-if="resultObject !== null && resultObject[formFocus].hasOwnProperty(key)"
              v-bind:class="{ locked: true }"
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
    <div class="DetailedEnrichment-dialog" :class="{ 'is-floating': floatingDialogs }">
      <button class="btn btn--md btn-info" @click="cancel" @keyup.enter="cancel">{{ translatePhrase('Cancel') }}</button>
      <button class="btn btn--md btn-primary" @click="confirm" @keyup.enter="confirm">{{ translatePhrase('Enrich') }}</button>
    </div>
  </div>
</template>

<style lang="less">

@fieldCol: 46%;
@fieldColMd: 45%;
@fieldColSm: 44%;
@fieldColXs: 42%;
@actionCol: 8%;
@actionColMd: 10%;
@actionColSm: 12%;
@actionColXs: 14%;

.DetailedEnrichment {
  width: 100%;
  height: 80vh;
  padding: 2rem 2rem 0 2rem;
  overflow-y: scroll;
  &.with-floating-dialog {
    margin-bottom: 5em;
  }

  &-dialog {
    background-color: @neutral-color;
    margin: 0 -1em;
    padding: 1.5rem 2.5rem;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    border: solid @grey-light;
    border-width: 1px 0px 0px 0px;
    button {
      margin-left: 1rem;
    }
    &.is-floating {
      position: absolute;
      bottom: 0px;
      left: 0;
      right: 0;
      margin: 0;
    }
  }

  &-table {
    width: 100%;
    td {
      vertical-align: top;
    }
    .Field {
      border-width: 1px;
    }
  }
  &-labelContainer {
    margin-bottom: 0.2rem;
    display: flex;
  }
  &-columnHeader {
    display: block;
  }

  &-summaryLabel {
    background-color: @grey-lighter;
    color: @grey-darker;
    padding: 0.15rem 0.5rem;
    font-size: 1.2rem;
    text-transform: uppercase;
    font-weight: 600;
    display: inline-block;
    border: 1px solid @grey-lighter;
  }
  &-summaryContainer {
    border: 1px solid @grey-lighter;
    background-color: @neutral-color;
  }
  &-rowContainer {
    width: 100%;
  }
  &-row {
    width: 100%;
    margin-bottom: 1rem;
  }
  &-fieldRow {
    width: 100%;
    display: flex;
    align-items: flex-start;
    .Field, .Field-content {
      border: 0;
    }
  }
  &-resultField {
    border: 1px solid @grey-lighter;
    &.is-diff {
      @base-color: @brand-accent3;
      border-color: @base-color;
      background-color: hsl(hue(@base-color), saturation(@base-color), lightness(@base-color)+51);
    }
    &.is-new {
      @base-color: @brand-success;
      border: 1px solid;
      border-color: @base-color;
      background-color: hsl(hue(@base-color), saturation(@base-color)-25, lightness(@base-color)+55);
    }
  }
  .sourceColumn, .resultColumn {
    width: @fieldColXs;
    @media (min-width: 900px) {
      width: @fieldColSm;
    }
    @media (min-width: 1200px) {
      width: @fieldColMd;
    }
    @media (min-width: 1500px) {
      width: @fieldCol;
    }
  }
  .actionColumn {
    width: @actionColXs;
    @media (min-width: 900px) {
      width: @actionColSm;
    }
    @media (min-width: 1200px) {
      width: @actionColMd;
    }
    @media (min-width: 1500px) {
      width: @actionCol;
    }
  }
  &-sourceField {
    border: 1px solid @grey-lighter;
  }

  &-sourceField, &-resultField, &-buttonContainer {
    &.non-existing {
      background-color: @grey-lightest;
    }
    min-height: 2em;
    display: flex;
  }
  &-buttonContainer {
    padding: 0 1%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    .Field-action {
      background-color: @white;
      align-items: baseline;
      justify-content: center;
      display: flex;
      color: @brand-primary;
      i {
        color: @brand-primary;
      }
      font-weight: bold;
      font-size: 1.2rem;
      padding: 0.5rem;
      cursor: pointer;
      width: 100%;
      border: solid @grey-light;
      border-width: 1px;
      margin: -1px -4px 0px 0px;
    }
  }
}

</style>
