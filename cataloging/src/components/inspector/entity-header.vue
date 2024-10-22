<script>
/*
  Entity summary is presented from this component, either within Inspector
  header or in fixed bar at top of window.
*/

import { each, throttle } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as StringUtil from 'lxljs/string';
import * as VocabUtil from 'lxljs/vocab';
import { translatePhrase } from '@/utils/filters';
import TagSwitch from '@/components/shared/tag-switch.vue';
import ReverseRelations from '@/components/inspector/reverse-relations.vue';
import LensMixin from '@/components/mixins/lens-mixin.vue';

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
      totalReverseCount: -1,
      itemReverseCount: -1,
    };
  },
  methods: {
    translatePhrase,
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
    itemCount(value) {
      this.itemReverseCount = value;
    },
    allCount(value) {
      this.totalReverseCount = value;
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
    showUsedIn() {
      if (this.recordType !== 'Instance') {
        return true;
      }

      const itemCountReady = this.itemReverseCount !== -1;
      return itemCountReady && this.totalReverseCount > 0 && this.totalReverseCount !== this.itemReverseCount;
    },
  },
  beforeUnmount() {
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
        :valueDisplayLimit=3
        :handleOverflow="false" />
      <div class="HeaderComponent-bottomBar">
        <div class="HeaderComponent-controls">
          <span
            v-if="hiddenDetailsNumber > 1"
            class="HeaderComponent-showMore"
            @click="showAllKeys = !showAllKeys">
            {{ translatePhrase(showAllKeys ? 'Show fewer' : 'Show more') }}{{ showAllKeys ? '' : ` (${hiddenDetailsNumber})` }}
          </span>
        </div>
        <div class="HeaderComponent-tags" v-if="user.isLoggedIn && inspector.status.isNew == false">
          <!-- <tag-switch :document="focusData" class="" :action-labels="{ on: 'Mark as', off: 'Unmark as' }" tag="Bookmark" /> -->
          <tag-switch
            :document="focusData"
            v-if="recordType === 'Instance'"
            class=""
            :action-labels="{ on: 'Mark as', off: 'Unmark as' }"
            tag="Flagged" />
        </div>
        <reverse-relations
          v-show="showUsedIn"
          @numberOfRelations="allCount"
          :main-entity="focusData"
          :compact="false" />
        <reverse-relations
          v-if="recordType === 'Instance'"
          @numberOfRelations="itemCount"
          :main-entity="focusData"
          :mode="'items'"
          :compact="false" />
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
  padding: 0.5em;
  @media (min-width: @screen-sm-min) {
    padding: 0.5em 1em 0.25em 1em;
  }

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
