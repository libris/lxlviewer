<script>
/*
  Entity summary is presented from this component, either within Inspector 
  header or in fixed bar at top of window.
*/

import { each, throttle } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as StringUtil from 'lxltools/string';
import * as VocabUtil from 'lxltools/vocab';
import TagSwitch from '@/components/shared/tag-switch';
import ReverseRelations from '@/components/inspector/reverse-relations';
import LensMixin from '@/components/mixins/lens-mixin';

export default {
  name: 'entity-header',
  mixins: [LensMixin],
  props: {
    full: {
      type: Boolean,
      default: false,
    },
    focusData: {
      type: Object,
      default: null,
    },
    recordData: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      showCompact: false,
      headerThreshold: 0,
      hiddenDetailsNumber: null,
      showAllKeys: false,
    };
  },
  methods: {
    handleScroll() {
      if (document.body.scrollTop > this.headerThreshold 
      || document.documentElement.scrollTop > this.headerThreshold) {
        this.showCompact = true;
      } else {
        this.showCompact = false;
      }
    },
    setHiddenDetailsNumber(value) {
      this.hiddenDetailsNumber = value;
    },
    setHeaderThreshold() {
      const headerContainer = document.getElementById('main-header');
      if (headerContainer !== null) {
        this.headerThreshold = headerContainer.offsetTop + headerContainer.offsetHeight - 20;
      }
    },
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
    ]),
    recordType() {
      return VocabUtil.getRecordType(
        this.focusData['@type'], 
        this.resources.vocab, 
        this.resources.context,
      );
    },
    state() {
      const state = this.inspector.status.level;
      if (state === 'mainEntity') {
        return 'Instance';
      } if (state === 'work') {
        return 'Work';
      }
      return 'Unknown';
    },
    compactSummary() {
      let summary = [];
      each(this.getSummary, (summaryArray) => {
        summary = summary.concat(StringUtil.getFormattedEntries(summaryArray, this.resources.vocab, this.user.settings.language, this.resources.context));
      });
      return summary.join(' • ');
    },
  },
  beforeDestroy() {
    window.removeEventListener('scroll', throttle(this.handleScroll, 300));
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener('scroll', throttle(this.handleScroll, 300));
      setTimeout(() => {
        this.setHeaderThreshold();
      }, 500);
    });
  },
  components: {
    TagSwitch,
    ReverseRelations,
  },
};
</script>

<template>
  <div class="EntityHeader HeaderComponent">
    <div class="EntityHeader-body HeaderComponent-body is-full">
      <entity-summary
        @hiddenDetailsNumber="setHiddenDetailsNumber"
        :show-all-keys="showAllKeys || hiddenDetailsNumber === 1"
        :focus-data="focusData"
        :record-data="recordData"
        :should-link="false"
        :exclude-components="inspector.status.isNew ? ['id'] : []"
        :valueDisplayLimit=3>
      </entity-summary>
      <div class="HeaderComponent-bottomBar">
        <div class="HeaderComponent-controls">
          <span v-if="hiddenDetailsNumber > 1" class="HeaderComponent-showMore" @click="showAllKeys = !showAllKeys">{{ showAllKeys ? 'Show fewer' : 'Show more' | translatePhrase }}{{ showAllKeys ? '' : ` (${hiddenDetailsNumber})` }}</span>
        </div>
        <div class="HeaderComponent-tags" v-if="user.isLoggedIn && recordType === 'Instance' && inspector.status.isNew == false">
          <tag-switch :document="focusData" class="" :action-labels="{ on: 'Flag for', off: 'Unflag for' }" tag="Directory care" />
        </div>
        <div class="HeaderComponent-relationsContainer"
          v-if="inspector.status.isNew == false">
          <reverse-relations 
            :main-entity="focusData" 
            :compact="false">
          </reverse-relations>
        </div>
      </div>
    </div>
    <!-- <div class="EntityHeader-body HeaderComponent-body is-compact">
      <div class="compact-header" :class="{ 'show-compact': showCompact }">
      {{ compactSummary }}
      </div>
    </div> -->
  </div>
</template>

<style lang="less">

.HeaderComponent {
  display: flex;
  border: 1px solid @grey-lighter;
  border-radius: 4px;
  padding: 0.5em 1em 0.25em 1em;

  &-body {
    &.is-full {
      flex: 8 8 100%;
      max-width: 100%;
      min-width: 0;
      .entity-summary {
        border-width: 0;
        height: 100%;
        * {
          color: @white;
        }
      }
    }

    &.is-compact {
      position: fixed;
      z-index: 2;
      top: 0;
      left: 0;
      width: 100%;
      
      @media print {
        display: none;
      }

      .compact-header {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        background: @brand-primary;
        color: @white;
        padding: 0.5em;
        box-shadow: 0 2px 5px rgba(0,0,0,.26);
        max-height: 0px;
        opacity: 0;
        transition: all 0.3s ease;
        line-height: 0;
        
        &.show-compact {
          max-height: 55px;
          opacity: 1;
          line-height: inherit;
        }
      }
    }
  }
  &-bottomBar {
    justify-content: space-between;
    display: flex;
  }

  &-controls {
    display: flex;
    flex-basis: 50%;
    flex-grow: 1;
    align-items: center;
  }
  &-showMore {
    font-weight: 600;
    font-size: 1.4rem;
    cursor: pointer;
    color: @link-color;
  }
  &-tags {
    display: flex;
    align-items: center;
    margin-right: 1em;
    .TagSwitch {
      display: flex;
    }
  }

  &-relationsContainer {
    display: flex;
    justify-content: flex-end;
  }
}

</style>
