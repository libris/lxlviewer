<script>
import {mapActions, mapGetters} from 'vuex';
import {cloneDeep, isEmpty} from 'lodash-es';
import {capitalize, labelByLang, translatePhrase} from '@/utils/filters';
import TabMenu from '@/components/shared/tab-menu.vue';
import EntitySummary from '@/components/shared/entity-summary.vue';
import EntityForm from "@/components/inspector/entity-form.vue";
import Button from '@/components/shared/button.vue';

export default {
  name: 'MergeRecords',
  props: {
    floatingDialogs: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    EntityForm,
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
    isAllSelected() {
      const noOfSelectable = Object.keys(this.sourceSelectable).length;
      if (this.formFocus === 'mainEntity') {
        return noOfSelectable === this.selectedForMainEntity.length;
      } else if (this.formFocus === 'record') {
        return noOfSelectable === this.selectedForRecord.length;
      } else {
        return false;
      }
    },
    selectedForMainEntity() {
      return this.inspector.status.selected.filter(s => s.path.startsWith('mainEntity.'));
    },
    selectedForRecord() {
      return this.inspector.status.selected.filter(s => s.path.startsWith('record.'));
    },
    recordType() {
      return this.enrichment.data.source.mainEntity['@type'];
    },
    formTabs() {
      return [
        { id: 'mainEntity', text: labelByLang(this.recordType) },
        { id: 'record', text: 'Admin metadata' },
      ];
    },
    sourceSelectable() {
      return Object.fromEntries(Object.entries(this.source).filter(([k]) => !k.startsWith('@')));
    },
    source() {
      return this.enrichment.data.source[this.formFocus];
    },
    target() {
      return this.inspector.data[this.formFocus];
    },
  },
  emits: ['onEnrich'],
  methods: {
    translatePhrase,
    labelByLang,
    capitalize,
    ...mapActions([
      'setEnrichmentResult',
      'setEnrichmentChanges'
    ]),
    resetCachedChanges() {
      this.setEnrichmentChanges(null);
    },
    close() {
      const mergeViewModal = this.inspector.status.mergeViewModal;
      mergeViewModal.open = false;
      this.resetCachedChanges();
      this.$store.dispatch('setInspectorStatusValue', { property: 'mergeViewModal', value: mergeViewModal });
    },
    cancel() {
      this.resetCachedChanges();
      this.close();
      this.$store.dispatch('setInspectorData', this.inspector.originalData);
      this.$store.dispatch('flushChangeHistory');
    },
    done() {
      this.resetCachedChanges();
      this.close();
    },
    setFocus(focus) {
      this.formFocus = focus;
    },
    selectAllForFocused() {
      let selected = [];
      Object.keys(this.sourceSelectable).forEach(k => {
          selected = [...selected, {path: `${this.formFocus}.${k}`, value: {}}];
      })
      this.$store.dispatch('setInspectorStatusValue', {
        property: 'selected',
        value: selected,
      });
      // TODO: for each in form tabs?
      this.$store.dispatch('pushInspectorEvent', {
        name: 'apply-source',
      });
    },
    clearAllSelected() {
      if (!isEmpty(this.inspector.status.selected)) {
        this.setSelectedAndApply([])
      }
    },
    setSelectedAndApply(selectedToKeep) {
      this.$store.dispatch('setInspectorStatusValue', {
        property: 'selected',
        value: selectedToKeep,
      });
      this.$store.dispatch('pushInspectorEvent', {
        name: 'apply-source',
      });
    },
    clearSelectedForFocused() {
      let keep = [];
      if (this.formFocus === 'mainEntity') {
        keep = this.inspector.status.selected.filter(s => s.path.startsWith('record'))
      } else if (this.formFocus === 'record') {
        keep = this.inspector.status.selected.filter(s => s.path.startsWith('mainEntity.'))
      }
      this.setSelectedAndApply(keep);
    },
    toggleSelected() {
      if (this.isAllSelected) {
        this.clearSelectedForFocused();
      } else {
        this.selectAllForFocused();
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      // this.resultObject = cloneDeep(this.enrichment.data.target);
      this.resultObject = cloneDeep(this.inspector.data);
      this.resetCachedChanges();
      this.clearAllSelected();
      // To populate this.enrichment.data.changes
      this.$store.dispatch('pushInspectorEvent', {
        name: 'apply-source',
      });
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
                :focus-data="this.enrichment.data.source.mainEntity"
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
                :focus-data="this.inspector.data.mainEntity"
                :should-link="false"
                :exclude-components="[]" />
            </div>
          </div>
        </div>
      </div>

      <span class="iconCircle"><i class="fa fa-fw fa-hand-pointer-o"/></span>
      <span class="DetailedEnrichment-description">
        {{translatePhrase('Select parts of the left record which should be copied to the right one.')}}
      </span>
      <div class="DetailedEnrichment-fieldRow">
          <tab-menu @go="setFocus" :tabs="formTabs" :active="formFocus" />
      </div>
      <div>
        <button
          class="btn btn--md btn-light SelectAll-btn"
          @click="toggleSelected">
          <i class="fa fa-fw fa-square-o" v-show="!isAllSelected"/>
          <i class="fa fa-fw fa-check-square-o" v-show="isAllSelected"/>
          {{ isAllSelected ? translatePhrase('Unmark all') : translatePhrase('Mark all') }}
        </button>
      </div>

      <div class="DetailedEnrichment-fieldRow">
        <div class="DetailedEnrichment-sourceField sourceColumn">
          <div class="entityForm">
            <entity-form
              :editing-object="formFocus"
              :key="formFocus"
              :is-active="true"
              :form-data="source"
              :locked="true"
              :hide-top-level-properties="['@type']"
              :hide-top-level-field-names="false"
              :is-source="true"
            />
          </div>
        </div>
        <div class="DetailedEnrichment-buttonContainer actionColumn">
        </div>

        <div
          class="DetailedEnrichment-resultField resultColumn">
          <div class="entityForm">
            <entity-form
              :editing-object="formFocus"
              :key="formFocus"
              :is-active="true"
              :form-data="target"
              :locked="true"
              :hide-top-level-properties="['@type']"
              :hide-top-level-field-names="false"
            />
          </div>
        </div>
      </div>
    </div>
    </div>
    <div class="DetailedEnrichment-dialog" :class="{ 'is-floating': floatingDialogs }">
      <button class="btn btn--md btn-info" @click="cancel" @keyup.enter="cancel">{{ translatePhrase('Cancel') }}</button>
      <button class="btn btn--md btn-primary" @click="done" @keyup.enter="done">{{ translatePhrase('Back to editing form') }}</button>
    </div>
</template>

<style lang="less">

@actionCol: 2%;
@actionColMd: 4%;
@actionColSm: 6%;
@actionColXs: 8%;

@sourceCol: 35%;
@sourceColMd: 34%;
@sourceColSm: 33%;
@sourceColXs: 32%;

@targetCol: 63%;
@targetColMd: 62%;
@targetColSm: 61%;
@targetColXs: 60%;

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
  &-description {
    padding-left: 0.5rem;
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
  .iconCircle {
    border: 1px solid @grey-lighter;
    border-radius: 1em;
    width: 2em;
    height: 2em;
    line-height: 2em;
    text-align: center;
    color: @brand-primary;
  }
  .sourceColumn {
    width: @sourceColXs;
    @media (min-width: 900px) {
      width: @sourceColSm;
    }
    @media (min-width: 1200px) {
      width: @sourceColMd;
    }
    @media (min-width: 1500px) {
      width: @sourceCol;
    }
  }

  .resultColumn {
    width: @targetCol;
    @media (min-width: 900px) {
      width: @targetColSm;
    }
    @media (min-width: 1200px) {
      width: @targetColMd;
    }
    @media (min-width: 1500px) {
      width: @targetCol;
    }
  }

  .entityForm {
    width: 100%;
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
