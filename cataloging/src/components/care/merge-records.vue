<script>
import {mapActions, mapGetters} from 'vuex';
import {cloneDeep} from 'lodash-es';
import {capitalize, labelByLang, translatePhrase} from '@/utils/filters';
import TabMenu from '@/components/shared/tab-menu.vue';
import EntitySummary from '@/components/shared/entity-summary.vue';
import EntityForm from "@/components/inspector/entity-form.vue";
import Button from '@/components/shared/button.vue';
import * as VocabUtil from "../../../../lxljs/vocab.js";
import * as StringUtil from "../../../../lxljs/string.js";
import {getChangeList} from "@/utils/enrich.js";
import * as DataUtil from "@/utils/data.js";

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
    recordType() {
      return this.enrichment.data.source.mainEntity['@type'];
    },
    formTabs() {
      return [
        { id: 'mainEntity', text: labelByLang(this.recordType) },
        { id: 'record', text: 'Admin metadata' },
      ];
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
    undo(key) {
      if (this.target.hasOwnProperty(key)) {
        this.resultObject[this.formFocus][key] = this.target[key];
      } else {
        delete this.resultObject[this.formFocus][key];
      }
    },
    enrich() {
      this.applyFieldsFromTemplate(this.enrichment.data.source);
    },
    applyFieldsFromTemplate(source) {
      const baseRecordData = cloneDeep(this.inspector.data);

      // This part checks if the template should include the work or not (to not overwrite a link)
      if (baseRecordData.mainEntity.hasOwnProperty('instanceOf')) {
        const baseRecordWork = baseRecordData.mainEntity.instanceOf;
        if (Object.keys(baseRecordWork).length === 1 && baseRecordWork.hasOwnProperty('@id')) {
          delete source.mainEntity.instanceOf;
        }
      }

      const changeList = [
        ...getChangeList(source, baseRecordData, ['mainEntity'], ['mainEntity'], this.resources.context),
        ...getChangeList(source, baseRecordData, ['record'], ['record'], this.resources.context)
      ];

      changeList.forEach((change) => {
        DataUtil.fetchMissingLinkedToQuoted(change.value, this.$store);
      });

      if (changeList.length !== 0) {
        this.$store.dispatch('updateInspectorData', {
          changeList: changeList,
          addToHistory: false,
        });
        this.$store.dispatch('setInspectorStatusValue', {
          property: 'enriched',
          value: changeList,
        });
        this.$store.dispatch('pushNotification', {
          type: 'success',
          message: `${changeList.length} ${StringUtil.getUiPhraseByLang('field(s) added from template', this.user.settings.language, this.resources.i18n)}`,
        });
      } else {
        this.$store.dispatch('pushNotification', {
          type: 'info',
          message: `${StringUtil.getUiPhraseByLang('The record already contains these fields', this.user.settings.language, this.resources.i18n)}`,
        });
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      // this.resultObject = cloneDeep(this.enrichment.data.target);
      this.resultObject = cloneDeep(this.inspector.data);
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
                :focus-data="source"
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
                :focus-data="target"
                :should-link="false"
                :exclude-components="[]" />
            </div>
          </div>
        </div>
      </div>
      <tab-menu @go="setFocus" :tabs="formTabs" :active="formFocus" />
      <button-component
        :inverted="true"
        class="Button-default"
        @click="enrich"
        :label="'Enrich'"
        icon="plus"
        size="large"
      />
      <div class="DetailedEnrichment-fieldRow">
        <div class="DetailedEnrichment-sourceField sourceColumn">
          <div class="entityForm">
            <entity-form
              :editing-object="'mainEntity'"
              :key="'mainEntity'"
              :is-active="true"
              :form-data="source"
              :locked="true"
              :hide-top-level-properties="['@type']"
              :hide-top-level-field-names="true"
              :show-enriched="false"
            />
          </div>
        </div>
        <div class="DetailedEnrichment-buttonContainer actionColumn">
        </div>

        <div
          class="DetailedEnrichment-resultField resultColumn">
          <div class="entityForm">
            <entity-form
              :editing-object="'mainEntity'"
              :key="'mainEntity'"
              :is-active="true"
              :form-data="target"
              :locked="false"
              :hide-top-level-properties="['@type']"
              :hide-top-level-field-names="true"
            />
          </div>
        </div>
      </div>
    </div>
    </div>
    <div class="DetailedEnrichment-dialog" :class="{ 'is-floating': floatingDialogs }">
      <button class="btn btn--md btn-info" @click="cancel" @keyup.enter="cancel">{{ translatePhrase('Cancel') }}</button>
      <button class="btn btn--md btn-primary" @click="confirm" @keyup.enter="confirm">{{ translatePhrase('Enrich') }}</button>
    </div>
</template>

<style lang="less">

@actionCol: 4%;
@actionColMd: 6%;
@actionColSm: 8%;
@actionColXs: 10%;

@sourceCol: 33%;
@sourceColMd: 32%;
@sourceColSm: 31%;
@sourceColXs: 30%;

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
